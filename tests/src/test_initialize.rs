use anchor_client::{Client, Cluster};
use anchor_client::solana_sdk::{
    commitment_config::CommitmentConfig,
    pubkey::Pubkey,
    signature::{read_keypair_file, Keypair, Signer},
    system_program,
    system_instruction,
};

#[test]
fn test_full_flow() {
    let anchor_wallet = std::env::var("ANCHOR_WALLET").unwrap_or_else(|_| {
        let home = std::env::var("HOME").expect("HOME env var not set");
        format!("{}/.config/solana/id.json", home)
    });
    let payer = read_keypair_file(&anchor_wallet).expect("Falha ao ler chaveiro da Solana");
    let client = Client::new_with_options(Cluster::Devnet, &payer, CommitmentConfig::confirmed());
    let program_id = contribution_registry::ID;
    let program = client.program(program_id).unwrap();

    let system_program_id = system_program::ID;

    let (registry_config, _bump) = Pubkey::find_program_address(&[b"config"], &program_id);

    let hospital_kp = Keypair::new();
    let (hospital_profile, _bump) = Pubkey::find_program_address(&[b"hospital", hospital_kp.pubkey().as_ref()], &program_id);

    let tx_fund = program
        .request()
        .instruction(system_instruction::transfer(
            &payer.pubkey(),
            &hospital_kp.pubkey(),
            10_000_000,
        ))
        .send()
        .expect("funding hospital keypair failed");
    println!("Fund hospital signature: {}", tx_fund);

    let tx_reg = program
        .request()
        .accounts(contribution_registry::accounts::RegisterHospital {
            hospital_profile,
            authority: hospital_kp.pubkey(),
            system_program: system_program_id,
        })
        .args(contribution_registry::instruction::RegisterHospital {})
        .signer(&hospital_kp)
        .send()
        .expect("register_hospital failed");
    println!("Register hospital signature: {}", tx_reg);

    let dummy_hash = [1u8; 32];
    let tx_contrib = program
        .request()
        .accounts(contribution_registry::accounts::RecordContribution {
            registry_config,
            hospital_profile,
            admin: payer.pubkey(),
        })
        .args(contribution_registry::instruction::RecordContribution {
            contribution_hash: dummy_hash,
        })
        .send()
        .expect("record_contribution failed");
    println!("Record contribution signature: {}", tx_contrib);

    let tx_reward = program
        .request()
        .accounts(contribution_registry::accounts::DistributeReward {
            registry_config,
            hospital_profile,
            authority: hospital_kp.pubkey(),
            admin: payer.pubkey(),
            system_program: system_program_id,
        })
        .args(contribution_registry::instruction::DistributeReward {})
        .send()
        .expect("distribute_reward failed");
    println!("Distribute reward signature: {}", tx_reward);
}
