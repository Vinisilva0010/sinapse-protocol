use anchor_lang::prelude::*;
use crate::state::RegistryConfig;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + RegistryConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub registry_config: Account<'info, RegistryConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let config = &mut ctx.accounts.registry_config;
    config.admin = ctx.accounts.admin.key();
    config.bump = ctx.bumps.registry_config;
    Ok(())
}
