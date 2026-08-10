use anchor_lang::prelude::*;
use crate::state::HospitalProfile;

#[derive(Accounts)]
pub struct RegisterHospital<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + HospitalProfile::INIT_SPACE,
        seeds = [b"hospital", authority.key().as_ref()],
        bump
    )]
    pub hospital_profile: Account<'info, HospitalProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn register_hospital(ctx: Context<RegisterHospital>) -> Result<()> {
    let profile = &mut ctx.accounts.hospital_profile;
    profile.authority = ctx.accounts.authority.key();
    profile.contributions_count = 0;
    profile.is_flagged_saboteur = false;
    profile.bump = ctx.bumps.hospital_profile;
    Ok(())
}
