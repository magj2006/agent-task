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
  const taskName = "Test Task";
  const taskDescription = "This is a test task description";

  it("Create and complete a task", async () => {
    // Find the task PDA
    const [taskPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("task"), taskId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Call the completeTask instruction
    const tx = await program.methods
      .completeTask({
        taskId: taskId,
        taskName: taskName,
        taskDescription: taskDescription,
      })
      .accounts({
        payer: wallet.publicKey,
      })
      .signers([])
      .rpc();

    console.log("Transaction signature:", tx);

    // Fetch the task account to verify it was initialized correctly
    const taskAccount = await program.account.task.fetch(taskPda);

    // Verify the task account data is set correctly
    expect(taskAccount.taskId.toString()).to.equal(taskId.toString());
    expect(taskAccount.taskStatus.completed).to.exist;
    expect(taskAccount.rewarder.toString()).to.equal(
      wallet.publicKey.toString()
    );
    expect(taskAccount.taskName).to.equal(taskName);
    expect(taskAccount.taskDescription).to.equal(taskDescription);

    console.log("Task created and completed successfully:", {
      taskId: taskAccount.taskId.toString(),
      taskStatus: "completed",
      rewarder: taskAccount.rewarder.toString(),
      taskName: taskAccount.taskName,
      taskDescription: taskAccount.taskDescription,
      bump: taskAccount.bump,
    });
  });
});
