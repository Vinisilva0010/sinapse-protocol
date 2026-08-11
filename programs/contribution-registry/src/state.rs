use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RegistryConfig {
    pub admin: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct HospitalProfile {
    pub authority: Pubkey,
    pub contributions_count: u64,
    pub rewarded_count: u64,
    pub is_flagged_saboteur: bool,
    pub bump: u8,
}
