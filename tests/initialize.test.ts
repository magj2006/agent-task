import { expect } from 'chai';

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

import { AgentTask } from '../target/types/agent_task';

describe("agent-task", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AgentTask as Program<AgentTask>;
  const wallet = provider.wallet;

  it("Initialize program config", async () => {
    // Find the config PDA - seed is 'initialize'
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("initialize")],
      program.programId
    );

    // Create a delegate and task manager for testing
    const taskManager = anchor.web3.Keypair.generate().publicKey;
    const delegate = anchor.web3.Keypair.generate().publicKey;

    // Call the initialize instruction
    const tx = await program.methods
      .initialize({
        taskManager: taskManager,
        delegate: delegate,
      })
      .accounts({
        payer: wallet.publicKey,
      })
      .signers([])
      .rpc();

    console.log("Transaction signature:", tx);

    // Fetch the config account to verify it was initialized correctly
    const configAccount = await program.account.config.fetch(configPda);

    // Verify the config account data is set correctly
    expect(configAccount.admin.toString()).to.equal(
      wallet.publicKey.toString()
    );
    expect(configAccount.taskManager.toString()).to.equal(
      taskManager.toString()
    );
    expect(configAccount.delegate.toString()).to.equal(delegate.toString());

    console.log("Config account initialized successfully:", {
      admin: configAccount.admin.toString(),
      taskManager: configAccount.taskManager.toString(),
      delegate: configAccount.delegate.toString(),
      bump: configAccount.bump,
    });
  });

  it("Initialize with default values", async () => {
    // Find the config PDA
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("initialize")],
      program.programId
    );

    // Call the initialize instruction with null values to test defaults
    const tx = await program.methods
      .initialize({
        taskManager: null,
        delegate: null,
      })
      .accounts({
        payer: wallet.publicKey,
      })
      .signers([])
      .rpc();

    console.log("Transaction signature (default values):", tx);

    // Fetch the config account to verify it was initialized correctly
    const configAccount = await program.account.config.fetch(configPda);

    // Verify the default values were set (should be payer's pubkey)
    expect(configAccount.admin.toString()).to.equal(
      wallet.publicKey.toString()
    );
    expect(configAccount.taskManager.toString()).to.equal(
      wallet.publicKey.toString()
    );
    expect(configAccount.delegate.toString()).to.equal(
      wallet.publicKey.toString()
    );
  });
});
