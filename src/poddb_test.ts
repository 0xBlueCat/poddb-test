import {ethers} from "ethers";
import * as podsdk from "poddb-evm-sdk-ts";
import {TagObject} from "poddb-evm-sdk-ts";
import {randomBytes} from "ethers/lib/utils";
import {randomInt} from "crypto";

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80").connect(provider)

const tagClassAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const tagAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

let tagClassCtr: podsdk.TagClassContract;
let tagCtr: podsdk.TagContract;

async function newTagClass():Promise<podsdk.NewTagClassLog>{
    const newTagClassTx = await tagClassCtr.newValueTagClass('reputation', 'reputation of defi score', [{
        fieldName:"name",
        fieldType:podsdk.TagFieldType.String
    },{
        fieldName:"age",
        fieldType:podsdk.TagFieldType.Uint8
    }])
    newTagClassTx.wait();

    const newTagClassRcp = await provider.getTransactionReceipt(newTagClassTx.hash);
    const newTagClassEvt = await tagClassCtr.parseNewTagClassLog(newTagClassRcp.logs[0]);
    console.log("NewTagClassEvt",JSON.stringify(newTagClassEvt, undefined, 2));
    return newTagClassEvt;
}

async function setTag(classId:string, tagObject:TagObject, data:string):Promise<podsdk.SetTagLog> {
    const setTagTx = await tagCtr.setTag(classId, tagObject, data);
    setTagTx.wait();

    const newTagRcp = await provider.getTransactionReceipt(setTagTx.hash);
    const setTagEvt = await tagCtr.parseSetTagLog(newTagRcp.logs[0]);
    console.log("SetTagEvt",JSON.stringify(setTagEvt, undefined, 2));
    return setTagEvt;
}

async function deleteTag(classId:string, tagObject:TagObject):Promise<podsdk.DeleteTagLog>{
    const delTagTx = await tagCtr.deleteTag(classId,tagObject);
    delTagTx.wait();

    const delTagRcp = await provider.getTransactionReceipt(delTagTx.hash);
    const delTagEvt = await tagCtr.parseDeleteTagLog(delTagRcp.logs[0]);
    console.log("DeleteTagEvt",JSON.stringify(delTagEvt, undefined, 2));
    return delTagEvt;
}

async function main(){
     tagClassCtr = (await podsdk.TagClassContract.getTagClassContractV1(provider, tagClassAddress)).connectSigner(wallet);
     tagCtr = (await podsdk.TagContract.getTagContractV1(provider,tagAddress)).connectSigner(wallet);

    const randomAddress = ethers.utils.hexlify(randomBytes(20));
    const tagObject = podsdk.TagObject.fromAddress(randomAddress);
    const data = new podsdk.WriteBuffer().writeString('Eric').writeUint8(randomInt(10,40)).getBytes();

    const newTagClassEvt = await newTagClass();
    await setTag(newTagClassEvt.ClassId, tagObject, data);
    await setTag(newTagClassEvt.ClassId, podsdk.TagObject.fromNFT(randomAddress, 1200),data);
    await setTag(newTagClassEvt.ClassId, podsdk.TagObject.fromTagClass(ethers.utils.hexlify(randomBytes(18))),data);
    // await deleteTag(newTagClassEvt.ClassId, tagObject);
}

void main().catch(error=>{
    console.log(error)
})
