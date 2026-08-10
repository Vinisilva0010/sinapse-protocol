use anchor_lang::prelude::*;
use crate::state::{HospitalProfile, RegistryConfig};
use crate::error::ContributionError;

#[derive(Accounts)]
pub struct RecordContribution<'info> {
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

pub fn record_contribution(ctx: Context<RecordContribution>, contribution_hash: [u8; 32]) -> Result<()> {
    let profile = &mut ctx.accounts.hospital_profile;
    require!(!profile.is_flagged_saboteur, ContributionError::HospitalIsSaboteur);
    profile.contributions_count = profile.contributions_count.saturating_add(1);
    msg!("Contribution hash: {:?}", contribution_hash);
    Ok(())
}
