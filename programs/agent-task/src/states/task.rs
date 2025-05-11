use crate::*;

#[account]
#[derive(InitSpace)]
pub struct Task {
    pub task_id: u64,
    pub task_status: TaskStatus,
    pub reward: u64,
    pub rewarder: Pubkey,
    pub bump: u8,
    #[max_len(50)]
    pub task_name: String,
    #[max_len(200)]
    pub task_description: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum TaskStatus {
    Pending,
    Completed,
    Failed,
    Confirmed,
    Claimed,
}
