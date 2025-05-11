use crate::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    pub task_manager: Pubkey,
    pub delegate: Pubkey,
    pub bump: u8,
}
