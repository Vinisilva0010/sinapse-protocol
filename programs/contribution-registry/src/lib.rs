use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ");

#[program]
pub mod contribution_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::initialize(ctx)
    }

    pub fn register_hospital(ctx: Context<RegisterHospital>) -> Result<()> {
        instructions::register_hospital::register_hospital(ctx)
    }

    pub fn record_contribution(ctx: Context<RecordContribution>, contribution_hash: [u8; 32]) -> Result<()> {
        instructions::record_contribution::record_contribution(ctx, contribution_hash)
    }

    pub fn flag_saboteur(ctx: Context<FlagSaboteur>) -> Result<()> {
        instructions::flag_saboteur::flag_saboteur(ctx)
    }
}
