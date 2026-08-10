use anchor_lang::prelude::*;
use crate::state::{HospitalProfile, RegistryConfig};

#[derive(Accounts)]
pub struct FlagSaboteur<'info> {
    #[account(
        seeds = [b"config"],
        bump = registry_config.bump,
        has_one = admin
    )]
    pub registry_config: Account<'info, RegistryConfig>,
    #[account(
        mut,
        seeds = [b"hospital", hospital_profile.authority.as_ref()],
        bump = hospital_profile.bump,
    )]
    pub hospital_profile: Account<'info, HospitalProfile>,
    pub admin: Signer<'info>,
}

pub fn flag_saboteur(ctx: Context<FlagSaboteur>) -> Result<()> {
    let profile = &mut ctx.accounts.hospital_profile;
    profile.is_flagged_saboteur = true;
    Ok(())
}
