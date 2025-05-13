// delegate will confirm task

use crate::*;

#[derive(Accounts)]
#[instruction(params: ConfirmTaskParams)]
pub struct ConfirmTask<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task".as_ref(), params.task_id.to_le_bytes().as_ref()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,

    #[account(
        seeds = [b"initialize".as_ref()],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}

impl ConfirmTask<'_> {
    pub fn handler(ctx: Context<ConfirmTask>, params: ConfirmTaskParams) -> Result<()> {
        msg!("confirming...");
        require!(
            ctx.accounts.payer.key() == ctx.accounts.config.delegate
                || ctx.accounts.payer.key() == ctx.accounts.config.admin,
            AgentTaskError::NotTaskManager
        );
        let task = &mut ctx.accounts.task;
        task.task_status = params.task_status;
        task.rewarder = params.rewarder;
        msg!("confirmed...");
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ConfirmTaskParams {
    pub task_id: u64,
    pub task_status: TaskStatus,
    pub rewarder: Pubkey,
}
