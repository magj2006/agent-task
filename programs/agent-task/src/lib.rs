use crate::error::*;
use crate::instructions::*;
use crate::states::*;
use anchor_lang::prelude::*;

mod error;
mod instructions;
mod states;

declare_id!("4UrP3GhXtV7o35usMeSHaacE44AnmAnjuE1xRfuVjXWx");

#[program]
pub mod agent_task {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
        Initialize::handler(ctx, params)
    }

    pub fn complete_task(ctx: Context<CompleteTask>, params: CompleteTaskParams) -> Result<()> {
        CompleteTask::handler(ctx, params)
    }

    pub fn confirm_task(ctx: Context<ConfirmTask>, params: ConfirmTaskParams) -> Result<()> {
        ConfirmTask::handler(ctx, params)
    }

    pub fn claim_task(ctx: Context<ClaimTask>, params: ClaimTaskParams) -> Result<()> {
        ClaimTask::handler(ctx, params)
    }
}
