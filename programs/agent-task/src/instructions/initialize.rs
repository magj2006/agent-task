use crate::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"initialize".as_ref()],
        bump)]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
}

impl Initialize<'_> {
    pub fn handler(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.payer.key();
        config.task_manager = params.task_manager.unwrap_or(ctx.accounts.payer.key());
        config.delegate = params.delegate.unwrap_or(ctx.accounts.payer.key());
        config.bump = ctx.bumps.config;

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeParams {
    pub task_manager: Option<Pubkey>,
    pub delegate: Option<Pubkey>,
}
