use anchor_lang::prelude::*;

#[error_code]
pub enum AgentTaskError {
    #[msg("Not Task Manager")]
    NotTaskManager,
    #[msg("Not Rewarder")]
    NotRewarder,
}
