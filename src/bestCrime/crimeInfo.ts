const crimeInfo = {
  shoplift: {
    name: "Shoplift",
    time: 2e3,
    money: 15e3,
    difficulty: 1 / 20,
    weights: {
      dexterity_success_weight: 1,
      agility_success_weight: 1,
    }
  },
  robStore: {
    name: "Rob Store",
    time: 60e3,
    money: 400e3,
    difficulty: 1 / 5,
    weights: {
      hacking_success_weight: 0.5,
      dexterity_success_weight: 2,
      agility_success_weight: 1,
    },
  },
  mug: {
    name: "Mug",
    time: 4e3,
    money: 36e3,
    difficulty: 1 / 5,
    weights: {
      strength_success_weight: 1.5,
      defense_success_weight: 0.5,
      dexterity_success_weight: 1.5,
      agility_success_weight: 0.5,
    },
  },
  larceny: {
    name: "Larceny",
    time: 90e3,
    money: 800e3,
    difficulty: 1 / 3,
    weights: {
      hacking_success_weight: 0.5,
      dexterity_success_weight: 1,
      agility_success_weight: 1,
    },
  },
  dealDrugs: {
    name: "Deal Drugs",
    time: 10e3,
    money: 120e3,
    difficulty: 1,
    weights: {
      charisma_success_weight: 3,
      dexterity_success_weight: 2,
      agility_success_weight: 1,
    },
  },
  bondForgery: {
    name: "Bond Forgery",
    time: 300e3,
    money: 4.5e6,
    difficulty: 1 / 2,
    weights: {
      hacking_success_weight: 0.05,
      dexterity_success_weight: 1.25,
    },
  },
  traffickArms: {
    name: "Traffick Arms",
    time: 40e3,
    money: 600e3,
    difficulty: 2,
    weights: {
      charisma_success_weight: 1,
      strength_success_weight: 1,
      defense_success_weight: 1,
      dexterity_success_weight: 1,
      agility_success_weight: 1,
    },
  },
  homicide: {
    name: "Homicide",
    time: 3e3,
    money: 45e3,
    difficulty: 1,
    weights: {
      strength_success_weight: 2,
      defense_success_weight: 2,
      dexterity_success_weight: 0.5,
      agility_success_weight: 0.5,
    }
  },
  grandTheftAuto: {
    name: "Grand Theft Auto",
    time: 80e3,
    money: 1.6e6,
    difficulty: 8,
    weights: {
      strength_success_weight: 1,
      defense_success_weight: 1,
      dexterity_success_weight: 4,
      agility_success_weight: 2,
      charisma_success_weight: 2,
    },
  },
  kidnap: {
    name: "Kidnap",
    time: 120e3,
    money: 3.6e6,
    difficulty: 5,
    weights: {
      charisma_success_weight: 1,
      strength_success_weight: 1,
      dexterity_success_weight: 1,
      agility_success_weight: 1,
    },
  },
  assassination: {
    name: "Assassination",
    time: 300e3,
    money: 12e6,
    difficulty: 8,
    weights: {
      strength_success_weight: 1,
      dexterity_success_weight: 2,
      agility_success_weight: 1,
    },
  },
  heist: {
    name: "Heist",
    time: 600e3,
    money: 120e6,
    difficulty: 18,
    weights: {
      hacking_success_weight: 1,
      strength_success_weight: 1,
      defense_success_weight: 1,
      dexterity_success_weight: 1,
      agility_success_weight: 1,
      charisma_success_weight: 1,
    },
  },
};

export default crimeInfo;
