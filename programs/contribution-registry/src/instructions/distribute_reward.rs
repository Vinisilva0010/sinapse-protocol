use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction;
use crate::state::{HospitalProfile, RegistryConfig};
use crate::error::ContributionError;

#[derive(Accounts)]
pub struct DistributeReward<'info> {
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
        constraint = hospital_profile.authority == authority.key()
    )]
    pub hospital_profile: Account<'info, HospitalProfile>,
    /// CHECK: Wallet do hospital que recebe a recompensa proporcional
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn distribute_reward(ctx: Context<DistributeReward>) -> Result<()> {
    let profile = &mut ctx.accounts.hospital_profile;
    require!(!profile.is_flagged_saboteur, ContributionError::HospitalIsSaboteur);

    let pending = profile.contributions_count.saturating_sub(profile.rewarded_count);
    require!(pending > 0, ContributionError::NoContributions);

    let reward_per_contribution: u64 = 1_000_000;
    let total_reward = pending.saturating_mul(reward_per_contribution);

    invoke(
        &system_instruction::transfer(
            ctx.accounts.admin.key,
            ctx.accounts.authority.key,
            total_reward,
        ),
        &[
            ctx.accounts.admin.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    profile.rewarded_count = profile.contributions_count;

    msg!("Recompensa de {} lamports distribuida para o hospital {} ({} contribuicoes pagas)", total_reward, ctx.accounts.authority.key(), pending);
    Ok(())
}
