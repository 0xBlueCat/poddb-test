import { ethers } from "ethers";
import * as podsdk from "poddb-evm-sdk-ts";
import { TagAgent, TagObject } from "poddb-evm-sdk-ts";
import { randomBytes } from "ethers/lib/utils";
import { randomInt } from "crypto";

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
).connect(provider);
const wallet2 = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
).connect(provider);

const tagClassAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const tagAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

let tagClassCtr: podsdk.TagClassContract;
let tagCtr: podsdk.TagContract;

const name = [
  "Bane",
  "Root",
  "Bite",
  "Song",
  "Roar",
  "Grasp",
  "Instrument",
  "Glow",
  "Bender",
  "Shadow",
  "Whisper",
  "Shout",
  "Growl",
  "Tear",
  "Peak",
  "Form",
  "Sun",
  "Moon",
  "Agony",
  "Apocalypse",
  "Armageddon",
  "Beast",
  "Behemoth",
  "Blight",
  "Blood",
  "Bramble",
  "Brimstone",
  "Brood",
  "Carrion",
  "Cataclysm",
  "Chimeric",
  "Corpse",
  "Corruption",
  "Damnation",
  "Death",
  "Demon",
  "Dire",
  "Dragon",
  "Dread",
  "Doom",
  "Dusk",
  "Eagle",
  "Empyrean",
  "Fate",
  "Foe",
  "Gale",
  "Ghoul",
  "Gloom",
  "Glyph",
  "Golem",
  "Grim",
  "Hate",
  "Havoc",
  "Honour",
  "Horror",
  "Hypnotic",
  "Kraken",
  "Loath",
  "Maelstrom",
  "Mind",
  "Miracle",
  "Morbid",
  "Oblivion",
  "Onslaught",
  "Pain",
  "Pandemonium",
  "Phoenix",
  "Plague",
  "Rage",
  "Rapture",
  "Rune",
  "Skull",
  "Sol",
  "Soul",
  "Sorrow",
  "Spirit",
  "Storm",
  "Tempest",
  "Torment",
  "Vengeance",
  "Victory",
  "Viper",
  "Vortex",
  "Woe",
  "Wrath",
  "Light's",
  "Shimmering",
];

async function newTagClass(
  name: string,
  desc: string,
  fields?: { fieldName: string; fieldType: podsdk.TagFieldType }[],
  options?: {
    agent?: TagAgent;
    contract?: string;
  }
): Promise<podsdk.NewTagClassLog> {
  let newTagClassTx;
  if (options && options.contract) {
    newTagClassTx = await tagClassCtr.newLogicTagClass(
      name,
      desc,
      options.contract,
      fields
    );
  } else {
    newTagClassTx = await tagClassCtr.newValueTagClass(name, desc, fields, {
      agent: options ? options.agent : undefined,
    });
  }
  newTagClassTx.wait();

  const newTagClassRcp = await provider.getTransactionReceipt(
    newTagClassTx.hash
  );
  const newTagClassEvt = await tagClassCtr.parseNewTagClassLog(
    newTagClassRcp.logs[0]
  );
  console.log("NewTagClassEvt", JSON.stringify(newTagClassEvt, undefined, 2));
  return newTagClassEvt;
}

async function setTag(
  classId: string,
  tagObject: TagObject,
  data?: string,
  expiredTime?: number
): Promise<podsdk.SetTagLog> {
  const setTagTx = await tagCtr.setTag(classId, tagObject, data, {
    expiredTime,
  });
  setTagTx.wait();

  const newTagRcp = await provider.getTransactionReceipt(setTagTx.hash);
  const setTagEvt = await tagCtr.parseSetTagLog(newTagRcp.logs[0]);
  console.log("SetTagEvt", JSON.stringify(setTagEvt, undefined, 2));
  return setTagEvt;
}

async function deleteTag(
  classId: string,
  tagObject: TagObject
): Promise<podsdk.DeleteTagLog> {
  const delTagTx = await tagCtr.deleteTag(classId, tagObject);
  delTagTx.wait();

  const delTagRcp = await provider.getTransactionReceipt(delTagTx.hash);
  const delTagEvt = await tagCtr.parseDeleteTagLog(delTagRcp.logs[0]);
  console.log("DeleteTagEvt", JSON.stringify(delTagEvt, undefined, 2));
  return delTagEvt;
}

async function generateCommonAddressTag() {
  console.log("generateCommonAddressTag");

  const tagClass = await newTagClass("student", "information of student", [
    {
      fieldName: "name",
      fieldType: podsdk.TagFieldType.String,
    },
    {
      fieldName: "age",
      fieldType: podsdk.TagFieldType.Uint8,
    },
    {
      fieldName: "score",
      fieldType: podsdk.TagFieldType.Uint8,
    },
    {
      fieldName: "sex",
      fieldType: podsdk.TagFieldType.Bool,
    },
  ]);
  const tags = new Array<podsdk.SetTagLog>();
  for (let i = 0; i < 100; i++) {
    const data = new podsdk.WriteBuffer()
      .writeString(name[randomInt(name.length)])
      .writeUint8(randomInt(10, 40))
      .writeUint8(randomInt(10, 40))
      .writeBool(randomInt(10) % 2 === 0)
      .getBytes();
    const randomAddress = ethers.utils.hexlify(randomBytes(20));
    const tagObject = podsdk.TagObject.fromAddress(randomAddress);
    const tag = await setTag(tagClass.classId, tagObject, data);
    tags.push(tag);
  }
  await deleteTag(tagClass.classId, tags[0].object);
}

async function generateNFTTag() {
  console.log("generateNFTTag");

  const tagClass = await newTagClass("score", "score of nft", [
    {
      fieldName: "score",
      fieldType: podsdk.TagFieldType.Uint8,
    },
  ]);
  const tags = new Array<podsdk.SetTagLog>();
  for (let i = 0; i < 50; i++) {
    const data = new podsdk.WriteBuffer()
      .writeUint8(randomInt(10, 100))
      .getBytes();
    const randomAddress = ethers.utils.hexlify(randomBytes(20));
    const tagObject = podsdk.TagObject.fromNFT(randomAddress, i);
    const tag = await setTag(tagClass.classId, tagObject, data);
    tags.push(tag);
  }
}

async function generateTagClassTag() {
  console.log("generateTagClassTag");

  const tagClass1 = await newTagClass("testTagClass1", "Test tagClass one");
  const tagClass2 = await newTagClass("testTagClass2", "Test tagClass two");
  const tagClass3 = await newTagClass("testTagClass3", "Test tagClass three");

  const tagClasses = [tagClass1, tagClass2, tagClass3];
  const tagClass4 = await newTagClass("identity", "identity of tagClass", [
    {
      fieldName: "name",
      fieldType: podsdk.TagFieldType.String,
    },
  ]);
  for (const tagClass of tagClasses) {
    const data = new podsdk.WriteBuffer().writeString(tagClass.name).getBytes();
    await setTag(
      tagClass4.classId,
      podsdk.TagObject.fromTagClass(tagClass.classId),
      data
    );
  }
}

async function generateAddressAgentTag() {
  console.log("generateAddressAgentTag");

  const tagClass = await newTagClass("meta", "meta of address", [],{
    agent:TagAgent.fromAddress(wallet2.address),
  });

  await setTag(tagClass.classId, TagObject.fromAddress(wallet.address))
}

async function generateTagClassAgentTag() {
  console.log("generateTagClassAgentTag");

  const agentTagClass = await newTagClass("agentTagClass", "Agent of TagClass");
  let tagObject = podsdk.TagObject.fromAddress(wallet2.address);
  await setTag(agentTagClass.classId, tagObject);

  const tagClass = await newTagClass(
    "coffee",
    "kind of coffee",
    [
      {
        fieldType: podsdk.TagFieldType.String,
        fieldName: "name",
      },
      {
        fieldName: "origin",
        fieldType: podsdk.TagFieldType.String,
      },
    ],
    {
      agent: podsdk.TagAgent.fromTagClass(agentTagClass.classId),
    }
  );

  tagCtr.connectSigner(wallet2);
  let data = new podsdk.WriteBuffer()
    .writeString("Espresso")
    .writeString("Italy")
    .getBytes();
  let randomAddress = ethers.utils.hexlify(randomBytes(20));
  tagObject = podsdk.TagObject.fromAddress(randomAddress);
  await setTag(tagClass.classId, tagObject, data, 3600);

  data = new podsdk.WriteBuffer()
    .writeString("Americano")
    .writeString("China")
    .getBytes();
  randomAddress = ethers.utils.hexlify(randomBytes(20));
  tagObject = podsdk.TagObject.fromAddress(randomAddress);
  await setTag(tagClass.classId, tagObject, data, 3600);

  data = new podsdk.WriteBuffer()
    .writeString("Cappuccino")
    .writeString("India")
    .getBytes();
  randomAddress = ethers.utils.hexlify(randomBytes(20));
  tagObject = podsdk.TagObject.fromAddress(randomAddress);
  await setTag(tagClass.classId, tagObject, data, 3600);

  tagCtr.connectSigner(wallet);
}

async function generateLogicTagClass(): Promise<void> {
  await newTagClass(
    "reputation",
    "reputation of defi",
    [
      {
        fieldName: "score",
        fieldType: podsdk.TagFieldType.Uint8,
      },
    ],
    {
      contract: "0xd4958cb5ab809c0d3070ee454505a37b00d7a908",
    }
  );
}

async function main() {
  tagClassCtr = (
    await podsdk.TagClassContract.getTagClassContractV1(
      provider,
      tagClassAddress
    )
  ).connectSigner(wallet);
  tagCtr = (
    await podsdk.TagContract.getTagContractV1(provider, tagAddress)
  ).connectSigner(wallet);

  await generateCommonAddressTag();
  await generateNFTTag();
  await generateTagClassTag();
  await generateAddressAgentTag();
  await generateTagClassAgentTag();
  await generateLogicTagClass();
}

void main().catch((error) => {
  console.log(error);
});
