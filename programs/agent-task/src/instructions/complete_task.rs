// craete task account and set task status to completed

use crate::*;

#[derive(Accounts)]
#[instruction(params: CompleteTaskParams)]
pub struct CompleteTask<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + Task::INIT_SPACE,
        seeds = [b"task".as_ref(), params.task_id.to_le_bytes().as_ref()],
        bump
    )]
    pub task: Account<'info, Task>,
    pub system_program: Program<'info, System>,
}

impl<'info> CompleteTask<'info> {
    pub fn handler(ctx: Context<CompleteTask>, params: CompleteTaskParams) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.task_id = params.task_id;
        task.rewarder = ctx.accounts.payer.key();
        task.task_status = TaskStatus::Completed;
        task.task_name = params.task_name;
        task.task_description = params.task_description;
        task.bump = ctx.bumps.task;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CompleteTaskParams {
    pub task_id: u64,
    pub task_name: String,
    pub task_description: String,
}
