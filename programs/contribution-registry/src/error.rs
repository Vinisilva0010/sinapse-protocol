use anchor_lang::prelude::*;

#[error_code]
pub enum ContributionError {
    #[msg("Hospital account is flagged as a saboteur.")]
    HospitalIsSaboteur,
    #[msg("Unauthorized action.")]
    Unauthorized,
    #[msg("No contributions recorded to claim reward.")]
    NoContributions,
}
