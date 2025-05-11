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

  // Test task parameters
  const taskId = new anchor.BN(1);

  // This test depends on a task being created first via the complete_task instruction
  it("Confirm a task", async () => {
    // Find the config PDA
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("initialize")],
      program.programId
    );

    // Find the task PDA
    const [taskPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("task"), taskId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Initialize config if it doesn't exist yet
    try {
      await program.account.config.fetch(configPda);
    } catch (e) {
      console.log("Config account doesn't exist, creating it first...");
      await program.methods
        .initialize({
          taskManager: null,
          delegate: null,
        })
        .accounts({
          payer: wallet.publicKey,
        })
        .signers([])
        .rpc();
    }

    // Create task if it doesn't exist yet
    try {
      await program.account.task.fetch(taskPda);
    } catch (e) {
      console.log("Task account doesn't exist, creating it first...");
      await program.methods
        .completeTask({
          taskId: taskId,
          taskName: "Test Task",
          taskDescription: "This is a test task description",
        })
        .accounts({
          payer: wallet.publicKey,
        })
        .signers([])
        .rpc();
    }

    // Call the confirmTask instruction
    const tx = await program.methods
      .confirmTask({
        taskId: taskId,
        taskStatus: { confirmed: {} },
        rewarder: wallet.publicKey,
      })
      .accounts({
        payer: wallet.publicKey,
      })
      .signers([])
      .rpc();

    console.log("Transaction signature:", tx);

    // Fetch the task account to verify it was updated correctly
    const taskAccount = await program.account.task.fetch(taskPda);

    // Verify the task status is updated
    expect(taskAccount.taskStatus.confirmed).to.exist;

    console.log("Task confirmed successfully:", {
      taskId: taskAccount.taskId.toString(),
      taskStatus: "confirmed",
      rewarder: taskAccount.rewarder.toString(),
      taskName: taskAccount.taskName,
      taskDescription: taskAccount.taskDescription,
    });
  });
});
