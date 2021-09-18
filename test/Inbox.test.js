const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider()); // instantiate Web3 class using local network
const { interface, bytecode } = require('../compile'); // properties of compile.js json result (interface: ABI, bytecode: compiled bytecode)

/*
STEPS
1. Mocha starts
2. Deploy a new contract (beforeEach)
3. Manipulate the contract (it)
4. Make an assertation (it)
*/

let accounts;
let inbox;
const initialMessage = 'Hi there!';

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();
    
    // Use one of those accounts to deploy the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface)) // instantiate contract with ABI
        .deploy({ data: bytecode, arguments: [initialMessage] }) // arguments used for contract's constructor function, 'initialMessage' in Inbox.sol
        .send({ from: accounts[0], gas: '1000000'}); // send a transaction that creates the contract on the network
});

describe('Inbox', () => {
    it('deploys a contract', () => {        
        assert.ok(inbox.options.address);
    });

    it('initializes message', async () => {
        const message = await inbox.methods.message().call(); // invoking message with call()
        assert.equal(message, initialMessage);
    });

    it('can change message', async () => {
        const newMessage = 'New message';

        await inbox.methods.setMessage(newMessage).send({ from: accounts[0], gas: '1000000' }); // invoking setMessage with send(transaction_object)

        const message = await inbox.methods.message().call();
        assert.equal(message, newMessage);
    });
});