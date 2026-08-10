use anchor_client::{
    CommitmentConfig,
    Client, Cluster, Signer,
};
use solana_keypair::read_keypair_file;
use solana_pubkey::{pubkey, Pubkey};

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

    let system_program = pubkey!("11111111111111111111111111111111");

    let (registry_config, _bump) = Pubkey::find_program_address(&[b"config"], &program_id);
    let (hospital_profile, _bump) = Pubkey::find_program_address(&[b"hospital", payer.pubkey().as_ref()], &program_id);

    let tx_init = program
        .request()
        .accounts(contribution_registry::accounts::Initialize {
            registry_config,
            admin: payer.pubkey(),
            system_program,
        })
        .args(contribution_registry::instruction::Initialize {})
        .send()
        .expect("initialize failed");
    println!("Initialize signature: {}", tx_init);

    let tx_reg = program
        .request()
        .accounts(contribution_registry::accounts::RegisterHospital {
            hospital_profile,
            authority: payer.pubkey(),
            system_program,
        })
        .args(contribution_registry::instruction::RegisterHospital {})
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

    let tx_flag = program
        .request()
        .accounts(contribution_registry::accounts::FlagSaboteur {
            registry_config,
            hospital_profile,
            admin: payer.pubkey(),
        })
        .args(contribution_registry::instruction::FlagSaboteur {})
        .send()
        .expect("flag_saboteur failed");
    println!("Flag saboteur signature: {}", tx_flag);
}
