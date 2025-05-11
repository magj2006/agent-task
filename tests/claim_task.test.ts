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

  // This test depends on a task being created and confirmed first
  it("Claim a task reward", async () => {
    // Find the task PDA
    const [taskPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("task"), taskId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Create and confirm task if needed
    // This ensures we have a task to claim
    try {
      const taskAccount = await program.account.task.fetch(taskPda);

      // If task is not in confirmed status, we need to complete and confirm it
      if (!taskAccount.taskStatus.confirmed) {
        // Find the config PDA for confirmation
        const [configPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("initialize")],
          program.programId
        );

        console.log("Task not confirmed, confirming it first...");

        // Initialize config if needed
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

        // Confirm the task
        await program.methods
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
      }
    } catch (e) {
      // Task doesn't exist, create it first
      console.log(
        "Task account doesn't exist, creating and confirming it first..."
      );

      // Create the task
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

      // Find the config PDA for confirmation
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("initialize")],
        program.programId
      );

      // Initialize config if needed
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

      // Confirm the task
      await program.methods
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
    }

    // Call the claimTask instruction
    const tx = await program.methods
      .claimTask({
        taskId: taskId,
      })
      .accounts({
        payer: wallet.publicKey,
      })
      .signers([])
      .rpc();

    console.log("Transaction signature:", tx);

    // Fetch the task account to verify it was updated correctly
    const taskAccount = await program.account.task.fetch(taskPda);

    // Verify the task status is updated to claimed
    expect(taskAccount.taskStatus.claimed).to.exist;

    console.log("Task reward claimed successfully:", {
      taskId: taskAccount.taskId.toString(),
      taskStatus: "claimed",
      rewarder: taskAccount.rewarder.toString(),
      taskName: taskAccount.taskName,
      taskDescription: taskAccount.taskDescription,
    });
  });
});
