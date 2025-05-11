// claim task reward

use crate::*;

#[derive(Accounts)]
#[instruction(params: ClaimTaskParams)]
pub struct ClaimTask<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task".as_ref(), params.task_id.to_le_bytes().as_ref()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
    pub system_program: Program<'info, System>,
}

impl<'info> ClaimTask<'info> {
    pub fn handler(ctx: Context<ClaimTask>, params: ClaimTaskParams) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.task.rewarder,
            ctx.accounts.payer.key(),
            AgentTaskError::NotRewarder
        );
        let task = &mut ctx.accounts.task;
        task.task_status = TaskStatus::Claimed;

        // transfer reward to payer

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ClaimTaskParams {
    pub task_id: u64,
}
