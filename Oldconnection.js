import { database } from "./firebase.js";
import { ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { npInfura, tokenCrtAddress } from './config.js';

let browserWallet;
let npWallet;
let currentAccount = 0;
let logicCrtAddress = "0x";

// get ABI Code return abicode
async function getABI(crtType) {
    let response;
    if (crtType == "token") { response = await fetch('./TokenCrt.json'); }
    else if (crtType == "logic") { response = await fetch('./LogicCrt.json'); }
    else { showError("Incorrect Contract ABI requested"); return; }
    const _abiCode = await response.json();
    return _abiCode;
}
// get crtAddress return crtAddress
async function getCrtAddress(crtType) {
    let _crtAddress;
    if (crtType == "token") {
        _crtAddress = tokenCrtAddress;
    }
    else if(crtType == "logic") {
        if(logicCrtAddress == "0x") { 
            showError("Logic Contract is not loaded yet!");
            return;
        }
        _crtAddress = logicCrtAddress;
    }
    return _crtAddress;
}

//initiate the contract instance return crtInstance
async function initContractInstance(contractType, provider){
    const abiCode = await getABI(contractType);
    const crtAddress = await getCrtAddress(contractType);
    let crtInstance;
    npWallet = new(browserWallet);
    const chainIDStatus = await checkChainId(npWallet);
    if (!chainIDStatus) {
        toastr.error("Inappropriate network! \n \nPlease switch to Polygon network!");
        return;
    }
    crtInstance = new npWallet.eth.Contract(abiCode, crtAddress);
    return crtInstance;
}

// get token balance information return token balance
async function getTokenBalance() {
    const balanceBtn = document.getElementById('getBalance');
    balanceBtn.innerHTML = `Checking Balance...<span><i class="bi bi-server"></i></span>`;
    try {
        const deGuessContract = await initContractInstance("token", "infura");
        const balance = await deGuessContract.methods.balanceOf(currentAccount).call();
         const normalBalance = npInfura.utils.fromWei(balance, 'ether');
         showSuccess( "Token balance:" +  normalBalance);
         balanceBtn.innerHTML = `Check Balance<span><i class="bi bi-server"></i></span>`;
         return normalBalance;
    } catch (error) {
        balanceBtn.innerHTML = `Check Balance<span><i class="bi bi-server"></i></span>`;
      toastr.error("Error getting token balance:" + error)
    }
}

async function clearPoolOnChain() { // Logic Contract
    try {
        const deGuessWalletInst = await initContractInstance("logic", "wallet");
        const estimatedGas = await deGuessWalletInst.methods.clearPool().estimateGas({ from: currentAccount });
        const adjustedGas = Number(BigInt(estimatedGas) * 200n / 100n);
        const status = await deGuessWalletInst.methods.clearPool().send({ from: currentAccount });
// Code rewrite required here        
// Event emission required from smart contract or Use the get all guess entries and check for empty/zero values        
    } catch (error) {
        if (error.code === 4001) { toastr.error("User rejected the transaction"); }
        else { toastr.error("Error clearing the pool", error); }
    }
}

async function getGuessEntry(SNo) { // Logic Contract
    try {
        const deGuessInfuraInst = await initContractInstance("logic", "infura");
        const guessData = await deGuessInfuraInst.methods.getGuessEntry(SNo).call({ from: currentAccount });
        return guessData;  // Update UI: Update all the fields with the Received Guess data
    } catch (error) {
        toastr.error("Error getting guess entry:", error); // Update UI: Error while fetching guess data
    }
}

async function getAllGuessEntries() { 
    try {
        const deGuessInfuraInst = await initContractInstance("logic", "infura");
        const guessEntries = await deGuessInfuraInst.methods.getAllGuessEntries().call({ from: currentAccount });
        // Indexing starts with 1 and not 0
        guessEntries.forEach((entry, index) => {
          
        });
        return guessEntries;// Update UI: Update all the Guess fields with the Received Guess data
    } catch (error) {
        toastr.error("Error getting all guess entries:", error); // Update UI: Error while fetching guess data
    }
}

// check validity hexadecimal return true or false
async function isValidChar(hexStr) {
    return /^[0-9a-fA-F]{64}$/.test(hexStr); // Ensure the input is a valid 64-character hex string
}

// remove prefix of hexadecimal value if starts with 0x
async function removePrefix(hexStr) {
    if (hexStr.startsWith('0x')) {
        return Promise.resolve(hexStr.slice(2)); // Remove '0x' prefix asynchronously
    }
    return Promise.resolve(hexStr);
}

async function tokenize(hexStr, tokenSize) {
    const tokens = [];
    for (let i = 0; i <= hexStr.length - tokenSize; i++) {
        tokens.push(hexStr.slice(i, i + tokenSize)); // Generate substrings (tokens) of the specified size
    }
    return tokens;
}

function encodeMatch(hitHex1, hitHex2) {
    return npInfura.eth.abi.encodeParameters(
        ['uint8', 'uint8', 'bool', 'bool', 'uint8', 'uint8', 'bool', 'bool'], 
        [
            hitHex1.startByte, hitHex1.endByte, hitHex1.leftSkip, hitHex1.rightSkip,
            hitHex2.startByte, hitHex2.endByte, hitHex2.leftSkip, hitHex2.rightSkip
        ]
    );
}

// generate hash 
async function genHashData(entValue) {  
    const hash = npInfura.utils.keccak256(entValue);
    return hash;
}

// get random block hash for if  guess complex  & return hash
async function getRandomBlockHash(seedHash, _targetBlockNumber) {
    if (seedHash.startsWith('0x')) { seedHash = seedHash.slice(2); }
    const byteHex = seedHash.slice(30, 32);
    const ranBlockPos = parseInt(byteHex, 16);
    let adjustedRanBlockPos = ranBlockPos;
    if (adjustedRanBlockPos > 127) { adjustedRanBlockPos = adjustedRanBlockPos / 2; }
    const randomBlockNumber = Number(_targetBlockNumber) - Number(adjustedRanBlockPos);
    const block = await npInfura.eth.getBlock(randomBlockNumber);
    if (block && block.hash != null && block.hash != undefined) {  
        return [block.hash, byteHex, adjustedRanBlockPos, randomBlockNumber]; }
    else { return null; }
}

async function fillDataFromContract() { // Logic Contract;
    try {
        const poolSize = 5;
        const deGuessInfuraInst = await initContractInstance("logic", "infura");
        let guessEntries = {};
        for (let SNo = 1; SNo <= poolSize; SNo++) {
            const guessData = await deGuessInfuraInst.methods.getGuessEntry(SNo).call({ from: currentAccount });
            guessEntries[SNo] = guessData;
        }
        return guessEntries;
    } catch (error) {
        toastr.error('Error fetching user data pool:', error);
    }
}

//check register of smart contract addresses
async function checkInSmartContract(walletAddress) { // Token Contract
    try {
        const deGuessInfuraInst = await initContractInstance("token", "infura");
        const isActive = await deGuessInfuraInst.methods.isUserActive().call({ from: walletAddress });

        if (isActive) { return true; } 
        else { return false; }

    } catch (error) {
        toastr.error('Error checking user status');
        
    }
}

// check chain id 
async function checkChainId(web3Instance) {
    try {
        let status = true;
        const currentNetwork = Number(await web3Instance.eth.getChainId());
        console.log("Current Network Selected is ",currentNetwork);
        if (currentNetwork === 137 || currentNetwork === 80002) { // To remove the testnet chain id in production
            status = true;
        } else{ status = false; }
        return status;
    } catch (error) {  toastr.error('Error in accessing chain id information'); }
}

// check the wallet configuration 
async function walletNetworkConfig(){
    try{
        if (browserWallet == null) { toastr.error('No wallet detected!'); return [false, "No wallet detected!"]; }
        let npWallet = new Web3(browserWallet);
        const isProperNetwork = await checkChainId(npWallet);
        if (!isProperNetwork) {toastr.error('Inappropriate network! Please switch to Polygon network.'); return [false, "Inappropriate network! Please switch to Polygon network."]; }
        return [true, "success"];
    } catch (error) {toastr.error(`${error.message}`); return [false, error.message]; } 
}

// handle the Network change 
async function handleNetworkChange() {
    try {
        await browserWallet.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13882' }], // 0x89 for Polygon Mainnet // 0x13882 for Polygon Amoy Testnet
        });
        return [true, "Switched to the expected network successfully"];
    } catch (error) {
        if (error.code === 4902) {
            toastr.error("Expected Network not found in the wallet");
            return [false, "Expected Network not found in the wallet"];
        } else if (error.code === 4001) {
            toastr.error("Network switch request was rejected");
            return [false, "Network switch request was rejected"];
        } else {
            toastr.error(`Network switch error: ${error.message}`);
            return [false, error.message];
        }
    }
}

// check the browser wallet is available
const checkBrowserWallet = async () => {
    try {
        if (!browserWallet) {
            toastr.error('No wallet detected!');
            return [false, "No wallet detected!"];
        }
        return [true, null];
    } catch (error) {
        return [false, error.message];
    }
};

const handleAccountsChanged = (accounts) => {
    if(currentAccount !== accounts[0]) { alert("Logged in account has been changed !!"); userLogOut(); }
    if (accounts.length === 0) { alert("No accounts detected!!"); userLogOut(); }
    if (currentAccount === 0){ console.log("No Registered Accounts !!"); return; }
};

const handleChainChanged = async (chainId) => {
    const currentChainId = parseInt(chainId, 16);
    if (currentChainId !== 137 && currentChainId !== 80002) { // Remove Testnet id in production
        const networkMessage = "Inappropriate Network \n \n \n Switch back to Polygon to stay Logged in ?";
        const networkChangeRequest = confirm(networkMessage);
        if (!networkChangeRequest) { userLogOut(); return; }
        else { const [networkStatus, netMsg] = await handleNetworkChange();
        if (networkStatus) { alert("Switched to Polygon Mainnet successfully!");}
        else { console.log("Unable to switch", netMsg); userLogOut(); return; }
        }
    }
};

// Register event listeners separately
const registerWalletEvents = async () => {
    const [walletAvailable, errorMessage] = await checkBrowserWallet();
    if (!walletAvailable) return;

    browserWallet.on('accountsChanged', handleAccountsChanged);
    browserWallet.on('chainChanged', handleChainChanged);
};

// login and register  return logic contract address
async function logIN(){
    const walletDetails = document.getElementById('walletDetails');
    const loginButton = document.getElementById('login');
    const registerBtn = document.getElementById('registerButton');
    const ProgressBar = document.getElementById('bar-progress');
    try {
        const [netStatus, statusMsg] = await walletNetworkConfig();
        console.log("Reason", statusMsg);
        if(!netStatus) { return false; }
        walletDetails.innerHTML = "Trying to Connect";
        loginButton.classList.add('d-none');
        registerBtn.classList.add('d-none');
        ProgressBar.classList.remove('d-none');
        const accounts = await browserWallet.request({ method: 'eth_requestAccounts' });
        console.log("Immediate After Accounts Retrival ==> ", browserWallet);
        const loginMessage = "Do you want to login to DeGuess with " + accounts[0];
        const loginRequest = await Swal.fire({
            title: 'Confirmation',
            text: loginMessage,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Okay',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => result.isConfirmed);
        let userRegistrationStatus;
        if (accounts.length >= 1 && loginRequest) { userRegistrationStatus = await checkInSmartContract(accounts[0]); }
        else { showError("Login Failed"); 
            walletDetails.innerHTML = "No Wallet Detected !";
            loginButton.classList.remove('d-none');
            registerBtn.classList.remove('d-none');
            ProgressBar.classList.add('d-none'); 
            return false; }
        if (userRegistrationStatus) {currentAccount = accounts[0];const deGuessInfuraInst = await initContractInstance("token", "infura");
        const _logicCrtAddress = await deGuessInfuraInst.methods.getLogicAddress().call({ from: currentAccount }); // Function yet to be added in SC
        if (_logicCrtAddress === '0x0000000000000000000000000000000000000000') { showError("Returns Zero");  return;}
        logicCrtAddress = _logicCrtAddress;
        showSuccess(`logicCrtAddress: ${logicCrtAddress}`);
        showSuccess(`Logged in using address: ${currentAccount}`);
        localStorage.setItem('logicCrtAddress', logicCrtAddress);
        localStorage.setItem('auth', JSON.stringify(true));
        localStorage.setItem('currentAccount', currentAccount);
        console.log("Before Index.html ===> ", browserWallet);
        setTimeout(()=>{
            window.location.href = 'index.html'
        }, 500);
        return true; } 
        else {showError('Not a Registered wallet address');}
        } catch (error) {
            walletDetails.innerHTML = "No Wallet Detected !";
            loginButton.classList.remove('d-none');
            registerBtn.classList.remove('d-none');
            ProgressBar.classList.add('d-none'); 
            if (error.message.includes("User denied transaction signature") || error.code == 4001) {
                toastr.error("User denied transaction signature.");
            }
            else if (error.message.includes("Internal JSON-RPC error") || error.code == -32603) { toastr.error("Please Increase Gas fee! Also Check gas, network settings!"); }
              else if (error.message.includes("revert")) { toastr.error("Transaction reverted. Contract conditions failed."); }
             else {
                toastr.error("Error submitting transaction");
            }
     }
}

async function registerWallet(){
    const walletDetails = document.getElementById('walletDetails');
    const loginButton = document.getElementById('login');
    const  registerBtn = document.getElementById('registerButton');
    const ProgressBar = document.getElementById('bar-progress');
    try {

        const [netStatus, statusMsg] = await walletNetworkConfig();
        if(!netStatus) { return false; }
        walletDetails.innerHTML = "Trying to Connect";
        loginButton.classList.add('d-none');
        registerBtn.classList.add('d-none');
        ProgressBar.classList.remove('d-none');
        const accounts = await browserWallet.request({ method: 'eth_requestAccounts' });
        const registerMessage = "Do you want to register with " + accounts[0] + " ??";
        const registerRequest = await Swal.fire({
            title: 'Confirmation',
            text: registerMessage,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Okay',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => result.isConfirmed);
        let userRegistrationStatus;
        if (accounts.length >= 1 && registerRequest) {userRegistrationStatus = await checkInSmartContract(accounts[0]); }
        else {toastr.error(`Registration Failed`); 
            walletDetails.innerHTML = "No Wallet Detected !";
            loginButton.classList.remove('d-none');
            registerBtn.classList.remove('d-none');
            ProgressBar.classList.add('d-none'); 
            return false; }
        if (userRegistrationStatus) { toastr.info("Already a registered user");return false; }
        const [userCreationStatus, creationErr] = await createUser(accounts[0]);
        if (userCreationStatus) { 
            currentAccount = accounts[0];
            showSuccess("logicCrtAddress :" + logicCrtAddress);
            showSuccess( 'Logged in using address' + currentAccount);
            localStorage.setItem('logicCrtAddress', logicCrtAddress);
            localStorage.setItem('auth', true);
            localStorage.setItem('currentAccount', currentAccount);
            createFireBaseTable(currentAccount);
            window.location.href = 'index.html'
            return true;}
        else {toastr.error("Registration Failed");  return false;}
    } catch (error) { 
        walletDetails.innerHTML = "No Wallet Detected !";
        loginButton.classList.remove('d-none');
        registerBtn.classList.remove('d-none');
        ProgressBar.classList.add('d-none'); 
        if (error.message.includes("User denied transaction signature") || error.code == 4001) {
            toastr.error("User denied transaction signature.");
        }
        else if (error.message.includes("Internal JSON-RPC error") || error.code == -32603) { toastr.error("Please Increase Gas fee! Also Check gas, network settings!"); }
          else if (error.message.includes("revert")) { toastr.error("Transaction reverted. Contract conditions failed."); }
         else {
            toastr.error("Error submitting transaction");
        }
        return false;
    }
}

// create user
async function createUser(walletAddress) { // Token Contract
    try {
        const deGuessWalletInst = await initContractInstance("token", "wallet");
        const estimatedGas = await deGuessWalletInst.methods.createUser().estimateGas({ from: walletAddress });
        const adjustedGas = Number(BigInt(estimatedGas) * 200n / 100n);
        let genLogicCrtAddress;
        const chkStatus = await deGuessWalletInst.methods.createUser().call({ from: walletAddress });
        const status = await deGuessWalletInst.methods.createUser().send({ from: walletAddress })
            .on('transactionHash', function (hash) {   showAlert("Transaction yet to be confirmed. Don't refresh the page.", "info") })
            // .on('confirmation', function (confirmationNumber, receipt) {  })
            .on('receipt', function (receipt) { 
                if (receipt.status) {
                    const events = receipt.events;
                    if (events && events.userCreationStatus) {
                        const { _userAddress, _userActive, _crtAddress } = events.userCreationStatus.returnValues;
                        if (_userAddress.toLowerCase() == walletAddress.toLowerCase() && _userActive) { genLogicCrtAddress = _crtAddress; }
                        
                    } else { return [false, "User Creation Failed!!"]; }
                } else { return [false, "No userCreationStatus event found in the receipt"]; }
            })
            .on('error', function (error) {
                if (error.code === 4001) { return [false, "User rejected the transaction"]; }
                else { return [false, error.message]; } 
            });
        const deGuessInfuraInst = await initContractInstance("token", "infura");
        const _logicCrtAddress = await deGuessInfuraInst.methods.getLogicAddress().call({ from: walletAddress }); 

        if (_logicCrtAddress === '0x0000000000000000000000000000000000000000') { showAlert("Returns Zero"); 
            return [false, "No logic contract address mapped with the wallet address"]; }
        logicCrtAddress = _logicCrtAddress;
        return [true, "success"];

    } catch (error) { 
        if (error.message.includes("User denied transaction signature") || error.code == 4001) {
            toastr.error("User denied transaction signature.");
        }
        else if (error.message.includes("Internal JSON-RPC error") || error.code == -32603) { toastr.error("Please Increase Gas fee! Also Check gas, network settings!"); }
          else if (error.message.includes("revert")) { toastr.error("Transaction reverted. Contract conditions failed."); }
         else {
            toastr.error("Error submitting transaction");
        }
         return [false, error.message]; }
}

// home function
// function for populate the data in table with guess entries (UI functions)
async function populateTable (guessArr, misMatchIds){
    const tableBody = document.getElementById('guessTableBody'); 
    const getMismatches =  misMatchIds;
    guessArr?.forEach((guess, index)=>{
        const row = `
        <tr class="${getMismatches?.includes(index + 1) ? 'mismatchedRow' : ''}">
          <td>
            <div class="guess-id">
              <span class="verify-dot"></span>
              <span class="id-no" data-bs-toggle="tooltip" title="${index + 1}">${index + 1}</span>
              <span data-bs-toggle="collapse" href="#guessDetails${index + 1}" role="button" aria-expanded="false" aria-controls="guessDetails${index + 1}">
                <i class="bi bi-caret-down-fill"></i>
              </span>
            </div>
          </td>
          <td class="text-nowrap">
            <span class="${Number(guess.targetVerified) === 2 ? 'verified' :  Number(guess.targetVerified) === 1 ? 'unverified' : 'info'}">
              <i class="bi ${ Number(guess.targetVerified) === 2 ? 'bi-patch-check' : Number(guess.targetVerified) === 1 ? 'bi-x-circle' : 'bi-exclamation-circle text-warn'}"></i>
              ${Number(guess.targetVerified) === 0 ? 'EMPTY' : Number(guess.targetVerified) === 1 ? 'Unverified' : 'Verified'}
            </span> 
          </td>
          <td>
          
            <div class="dropdown">
               
              <a class="" href="#" role="button" id="dropdownMenuLink${guess.id}" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="bi bi-three-dots-vertical"></i>
              </a>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink${index + 1}">
                <li class="redirectNewGuess" data-id="${index + 1}"><span class="dropdown-item cursor-pointer cursor-pointer">New Guess</span> </li>
                <li class="redirectVerifyGuess" data-id="${index + 1}"  > <span class="dropdown-item cursor-pointer cursor-pointer ${Number(guess.targetVerified) === 2  ? 'd-none' : '-'}">Verify</span></li>
                <li class="checkValidate" data-id="${index + 1}" ><span class="dropdown-item cursor-pointer cursor-pointer">Validity</span> </li>
              </ul>
            </div>
          </td>
        </tr>
        <tr id="guessDetails${index + 1}" class="collapse">
          <td colspan="3">
            <div class="guess-details card card-body">
            <div class="text-center">
                <label>Actual Hash</label>
                <p>${guess.actualHash}</p>
              </div>
              <div class="text-center">
                <label>Secret Key</label>
                <p>${guess.secretKey}</p>
              </div>
              <div class="text-center">
                <label>Dummy Hash</label>
                <p>${guess.userHashGuess}</p>
              </div>
              <hr>
              <div class="d-flex justify-content-around">
                <div class="d-block">
                  <label>Target Block Number</label>
                  <p>${Number(guess.targetBlockNumber)}</p>
                </div>
                <div class="d-block">
                  <label>Token Sizes</label>
                  <p>${Number(guess.tokenSize)}</p>
                </div>
                <div class="d-block">
                  <label>PaidGuess</label>
                  <p><span class="badge bg-${guess.paidGuess == true ? 'success' : 'danger'}">${guess.paidGuess}</span></p>
                </div>
                <div class="d-block">
                  <label>Complex</label>
                  <p><span class="badge bg-${guess.complex == true ? 'success' : 'danger'}">${guess.complex}</span></p>
                </div>
              </div>
            </div>
          </td>
        </tr>`;
        
        tableBody.insertAdjacentHTML('beforeend', row);
    })
    const guessItems = document.querySelectorAll('.redirectNewGuess');
     guessItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            const getSingleGuess = guessArr.find(guess => guess.guessId === Number(id));
            localStorage.setItem('singleGuess', JSON.stringify(getSingleGuess));
            window.location.href = "/old-data.html"
        });
    });
    const verifyItems = document.querySelectorAll('.redirectVerifyGuess');
    verifyItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            const getSingleGuess = guessArr.find(guess => guess.guessId === Number(id));
            localStorage.setItem('singleGuess', JSON.stringify(getSingleGuess));
            window.location.href = "/get-seed-data.html"
        });
    });
    const validateItems = document.querySelectorAll('.checkValidate');
    validateItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            fetchBlockRangeIndication(id);
        });
    });
}

 // function for fetch the block range 
async function fetchBlockRangeIndication(_SNo){
    try {
        const deGuessInfuraInst = await initContractInstance("logic", "infura");
        const guessData = await deGuessInfuraInst.methods.getGuessEntry(_SNo).call({ from: currentAccount });
        if(!guessData) { toastr.error("unable to fetch the Guess Data"); return [null, "unable to fetch the Guess Data"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
        if(guessData.targetVerified == "verified" || Number(guessData.targetVerified) == 2) { 
            toastr.error("Guess Already Verified");
            return [null, "guess Verified Already"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
        if(guessData.targetVerified == "empty" || Number(guessData.targetVerified) == 0) { 
            toastr.error("Guess is empty");
            return [null, "guess is Empty"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
        const targetBlockNumber = guessData.targetBlockNumber;
        const currentBlockNumber = await npInfura.eth.getBlockNumber();
        const blockDistance = Number(currentBlockNumber) - Number(targetBlockNumber);
        if(blockDistance <= -1) { toastr.error("Block yet to be mined"); return [null,"Block yet to be mined"]; }
            if(!guessData.complex) {
                if (blockDistance <= 255) {
                    let blockRangeIndication = "";
                    if(blockDistance <= 64) { blockRangeIndication = "dark green";  toastr.info(`Block Indication: ${blockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#006400"); }
                    if(blockDistance > 64 && blockDistance <= 128) { blockRangeIndication = "light green"; toastr.info(`Block Indication: ${blockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#90EE90"); }
                    if(blockDistance > 128 && blockDistance <= 192) { blockRangeIndication = "light red";  toastr.info(`Block Indication: ${blockRangeIndication}, Block Distance: ${blockDistance}`);  $(".toast-info").css("background-color", "#FF7F7F"); }
                    if(blockDistance > 192) { blockRangeIndication = "dark red";toastr.info(`Block Indication: ${blockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#8B0000");  }
                    return [blockDistance, blockRangeIndication];
                } 
                else { 
                   
                    toastr.error("Block out of range"  + 'Block Distance -' + blockDistance,)
                    return [null, "Block out of range"]; 
                }/* Update UI: As 0x0...0 in Generated Hash Textbox */ }
            if (guessData.complex) {
                if (blockDistance <= 128) {
                    let ranblockRangeIndication = "";
                    if(blockDistance <= 32) { ranblockRangeIndication = "dark green";  toastr.info(`Block Indication: ${ranblockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#006400");}
                    if(blockDistance > 32 && blockDistance <= 64) { ranblockRangeIndication = "light green";  toastr.info(`Block Indication: ${ranblockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#90EE90");}
                    if(blockDistance > 64 && blockDistance <= 96) { ranblockRangeIndication = "light red";toastr.info(`Block Indication: ${ranblockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#FF7F7F");  }
                    if(blockDistance > 96) { ranblockRangeIndication = "dark red";toastr.info(`Block Indication: ${ranblockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#8B0000");}
                    return [ blockDistance, ranblockRangeIndication];
                } else { toastr.error("Block out of range"  + 'Block Distance -' + blockDistance); return [null, "Block out of range"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
            }

    } catch (error) { toastr.error("Error fetching guess entry");  /* Update UI: Error while fetching guess data */ } 
}

//function for check the synchronization pool data
async function syncDataWithTokenCrt(){
    const syncBtn=  document.getElementById('syncPoolDatabtn');
    const [netStatus, statusMsg] = await walletNetworkConfig();
    if(!netStatus) { return false; }
    try {
        syncBtn.innerHTML = `Syncing....`
        syncBtn.disabled = true;
      const deGuessWalletInst = await initContractInstance("logic", "wallet");
      const estimatedGas = await deGuessWalletInst.methods.syncPoolData().estimateGas({ from: currentAccount });
 
      const adjustedGas = Number(BigInt(estimatedGas) * 200n / 100n);
      const result = await deGuessWalletInst.methods.syncPoolData().send({ from: currentAccount })
                     .on('transactionHash', function (hash) {  })
                     // .on('confirmation', function (confirmationNumber, receipt) {  })
                     .on('receipt', function (receipt) { 
                      if (receipt.status) {
                        const events = receipt.events;
                        if (events && events.updatedPoolData) {
                         const emittedValues = events.updatedPoolData.returnValues;
                          if ((currentAccount.toLowerCase()) == (emittedValues._userAddress.toLowerCase()) && emittedValues.updateStatus) {
                            /* Update UI Pool & Reward data Sync. */
                            toastr.success("Pool Data Synchronization Success! Returned Status True");
                            syncBtn.innerHTML = `Sync Pool Data`
                            syncBtn.disabled = false;
                            return true;
                          } else if((currentAccount.toLowerCase()) == (emittedValues._userAddress.toLowerCase()) &&  !emittedValues.updateStatus){
                            syncBtn.innerHTML = `Sync Pool Data`
                            syncBtn.disabled = false;
                            toastr.success("No Synchronization Required! Returned Status False"); return false;
                          } else {  toastr.error("Incorrect data received"); syncBtn.innerHTML = `Sync Pool Data`
                            syncBtn.disabled = false; return false;}
                                  
                        } else {syncBtn.innerHTML = `Sync Pool Data`;syncBtn.disabled = false;  toastr.error("Unable to retrieve event data"); return false; }
                      } else {syncBtn.innerHTML = `Sync Pool Data`;syncBtn.disabled = false; toastr.error("Data Synchronization Failed - No Event Emitted!"); return false; }
                    })
                    .on('error', function (error) {
                      if (error.code === 4001) {  }
                      else {  }
                    });
  
    } catch (error) {
        syncBtn.innerHTML = `Sync Pool Data`;syncBtn.disabled = false; 
        if (error.message.includes("User denied transaction signature") || error.code == 4001) {
            toastr.error("User denied transaction signature.");
        }
        else if (error.message.includes("Internal JSON-RPC error") || error.code == -32603) { toastr.error("Please Increase Gas fee! Also Check gas, network settings!"); }
          else if (error.message.includes("revert")) { toastr.error("Transaction reverted. Contract conditions failed."); }
         else {
            toastr.error("Error submitting transaction");
        }
        toastr.error("Synchronization failed with error");
    }
  
}

//  new guess page functions
// handle the overwrite true false in form
function OnOverwriteChange() {
    const overwrite = document.getElementById('overwrite');
    const submitBtn =  document.getElementById("submitNewGuess")
    if (!overwrite) return; // Safeguard against missing element.

    const OverwriteValue = overwrite.value; // Get the current value
    const form = document.getElementById('myForm');
    const formElements = document.querySelectorAll('#myForm input, #myForm select');
    const isReadOnly = OverwriteValue === "false"; // Determine the readonly state

    formElements.forEach(element => {
        if (element.id !== 'overwrite') { // Skip the overwrite element itself
            if (element.type === 'text' || element.type === 'number') {
                element.readOnly = isReadOnly; // Use readonly for input elements
            } else if (element.tagName === 'SELECT') {
                // Simulate "readonly" behavior by preventing interaction without using disabled
                if (isReadOnly) {
                    element.setAttribute('readonly', 'true'); // Custom attribute to mark it
                    element.addEventListener('mousedown', preventInteraction);
                } else {
                    element.removeAttribute('readonly');
                    element.removeEventListener('mousedown', preventInteraction);
                }
            }
        }
        if (isReadOnly) {
            element.classList.add('read-only');
            submitBtn.style.display = "none";
            
        } else {
            element.classList.remove('read-only');
            submitBtn.style.display = "inline-block";
        }
    });
}

// prevent user from interacting with form inputs while it's in read-only mode
function preventInteraction(event) {
    event.preventDefault();
}

// patch form values of guess entries to the form fields
async function patchFormValuesFromGuess () { 
    const retrieved = JSON.parse(localStorage.getItem('singleGuess'));
    if(!retrieved) { toastr.error(`Can't retrieved Guess Data`); return false; }else{
        const [netStatus, statusMsg] = await walletNetworkConfig();
        if(!netStatus) {  return false; }
    }
   // Patch values into the form fields
     document.getElementById('guessId').value = retrieved.guessId || '';
    // document.getElementById('Token_Size').value = JSON.stringify(retrieved.tokenSize) || '';
    document.getElementById('paid_guess').value = retrieved.paidGuess ? 'true' : 'false';
    document.getElementById('overwrite').value =  'true';
    document.getElementById('complex').value = retrieved.complex ? 'true' : 'false';
    document.getElementById("target_block").innerHTML = `Previous Target Block Number : ${retrieved.targetBlockNumber}`;
    document.getElementById("userHashGuess").innerHTML = `Previous Hash Committed: ${retrieved.userHashGuess}`;
        // Initial visibility based on `retrieved.paidGuess`
if (retrieved.paidGuess === true) {
    document.getElementById('true-notes').style.display = "block";
    document.getElementById('false-notes').style.display = "none";
} else if (retrieved.paidGuess === false) {
    document.getElementById('true-notes').style.display = "none";
    document.getElementById('false-notes').style.display = "block";
} else {
    document.getElementById('true-notes').style.display = "none";
    document.getElementById('false-notes').style.display = "none";
}

document.querySelector('#Block_Increment_Count').addEventListener('change', (e) => {
    const value = Number(e.target.value.trim()); // Trim and convert to a number
    const validationElement = document.getElementById('blockValidation'); // Correct usage of getElementById
    
    if (!value ) { // Check if the value is empty or zero
        validationElement.innerHTML = "Block Increment Count cannot be empty.";
    } else if (value == 0){
        validationElement.innerHTML = "Block Increment Count cannot be zero.";
    } else if (value <= 512 || value >= 2049) { // Check if it's outside the valid range
        validationElement.innerHTML = "Please enter a valid block number between 513 and 2048.";
    } else {
        validationElement.innerHTML = ""; // Clear the message if input is valid
    }
});

document.querySelector('#Token_Size').addEventListener('change', (e) => {
    const value = Number(e.target.value.trim()); // Trim and convert to a number
    const validationElement = document.getElementById('tokenValidation'); // Correct usage of getElementById
    if (!value ) { // Check if the value is empty or zero
        validationElement.innerHTML = "Token Size cannot be empty.";
    } else if (value == 0){
        validationElement.innerHTML = "Token Size cannot be zero.";
    }
    else if (value <= 2 || value >= 65) { // Check if it's outside the valid range
        validationElement.innerHTML = "Please enter a valid token size between 3 and 64.";
    } else {
        validationElement.innerHTML = ""; // Clear the message if input is valid
    }
});


// Add event listener to the dropdown
document.getElementById('paid_guess').addEventListener('change', function () {
    const selectedValue = this.value; 
    const trueNotes = document.getElementById('true-notes');
    const falseNotes = document.getElementById('false-notes');

    // Hide both sections initially
    trueNotes.style.display = 'none';
    falseNotes.style.display = 'none';

    if (selectedValue === "true") {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to proceed with Paid Guess?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                trueNotes.style.display = 'block'; 
            }
        });
    } else if (selectedValue === "false") {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to proceed with Free Guess?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                falseNotes.style.display = 'block'; 
            }
        });
    }
});
   document.querySelector('.actual-hash-btn').addEventListener('click', GenActualHashInput)
   document.querySelector('.secret-btn').addEventListener('click', GenSecretKeyInput)
   document.querySelector('#clear-btn').addEventListener('click', clearForm);
   document.getElementById('secretKey').addEventListener('input', (e) => {
    document.getElementById('secretKeyLength').innerHTML = `Your hash length: ${e.target.value.length}`;
  });
  document.getElementById('actualHash').addEventListener('input', (e) => {
    document.getElementById('actualHashLength').innerHTML = `Your hash length: ${e.target.value.length}`;
  });
  
//    document.addEventListener('input', updateDummyhash)
  
}

// generate the actual hash
async function GenActualHashInput() {
    const actualHash = document.getElementById('actualHash').value.trim();
         const generatedHash = await genHashData(actualHash);
         if(generatedHash){
            document.getElementById('actualHash').value = generatedHash;
            const length = await removePrefix(generatedHash)
            document.getElementById('actualHashLength').innerHTML = `Your hash length :${length.length}`
            return true;
  }
}

// generate the actual hash
async function GenSecretKeyInput() {
    const secretKeyHash = document.getElementById('secretKey').value.trim();
       const GensecretKey = await genHashData(secretKeyHash);
       if(GensecretKey){
        document.getElementById('secretKey').value = GensecretKey;
        const length = await removePrefix(GensecretKey)
        document.getElementById('secretKeyLength').innerHTML = `Your hash length :${length.length}`
        return true;
     }
}

 // onChange function for check the actual hash
const checkOnChangeActualHash = async (e) => {
    const value = e.target.value.trim();
    if (value === "") {
        return false;
    }
    const prefixProcess = await removePrefix(value);
    const testHash = await isValidChar(prefixProcess);
    if (testHash === true) {
        return true;
    } else {
        return false;
    }
};

// onChange function for check the secret key
const checkOnChangeSecretKey = async (e) => {
    const value = e.target.value.trim();
    if (value === "") {
        return false;
    }
    const prefixProcess = await removePrefix(value);
    const testHash = await isValidChar(prefixProcess);
    if (testHash === true) {
        return true;
    } else {
        return false;
    }
};

// function for generating the dummy hash form (combination of actual and secret keys)
const generateDummyHash = async () => {
    const dummyHashInput = document.getElementById('dummyHash');
    dummyHashInput.value = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const getActualInputValue = document.querySelector('#actualHash').value.trim();
    const getSecretKeyInputValue = document.querySelector('#secretKey').value.trim();
    const setError = (inputId, message) => {
        const inputElement = document.querySelector(`#${inputId}`);
        const parent = inputElement.parentElement;
        // Remove existing error message
        const existingError = parent.querySelector('.error-message');
        if (existingError) existingError.remove();
        if (message) {
            const errorTag = document.createElement('small');
            errorTag.className = 'error-message text-danger';
            errorTag.textContent = message;
            parent.appendChild(errorTag);
        }
    };
    let isActualHashValid = false;
    let isSecretKeyValid = false;
    try {
        isActualHashValid = await checkOnChangeActualHash({ target: { value: getActualInputValue } });
        if (!isActualHashValid) {
            setError('actualHash', 'Invalid Actual Hash');
            document.querySelector('#actualHash').classList.add('error');
        } else {
            setError('actualHash', null);
            document.querySelector('#actualHash').classList.remove('error');
        }

        isSecretKeyValid = await checkOnChangeSecretKey({ target: { value: getSecretKeyInputValue } });
        if (!isSecretKeyValid) {
            setError('secretKey', 'Invalid Secret Key');
            document.querySelector('#secretKey').classList.add('error');
        } else {
            setError('secretKey', null);
            document.querySelector('#secretKey').classList.remove('error');
        }

        if (isActualHashValid && isSecretKeyValid) {
            const autoUnrevealedHash = await getUnrevealedHash(getActualInputValue, getSecretKeyInputValue);
            dummyHashInput.value = autoUnrevealedHash;
        } else {
            toastr.error("Dummy Hash generation aborted due to invalid input.");

        }
    } catch (error) {
        toastr.error("An unexpected error occurred")
    }
};

// onSubmit the form values of new guess
async function OnFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target); 
    const formValues = {};
    formData.forEach((value, key) => {
        formValues[key] = value.trim(); 
    });
   
    // Validate required fields
    const requiredFields = {
        guessId: 'Guess ID is required.',
        Block_Increment_Count: 'Block Increment Count is required.',
        actualHash: 'Actual Hash is required.',
        secretKey: 'Secret Key Hash is required.',
        dummyHash: 'Dummy Hash is required.',
        Token_Size: 'Token Size is required.',
    };
    // Collect errors
    let errors = [];
    for (let field in requiredFields) {
        if (!formValues[field]) {
            errors.push(requiredFields[field]);
        }
    }
    // Validate guessHash format
    const dummyHash = formValues.dummyHash;
    const actualHash = formValues.actualHash;
    const secretKey = formValues.secretKey;
    const blockIncrementCount = formValues.Block_Increment_Count;
    const tokenSize = formValues.Token_Size;
    const actualHashValue = formValues.actualHash;
    const secretKeyValue = formValues.secretKey;
    const overWrite = formValues.overwrite;
    const cleanedGuessHash = await removePrefix(dummyHash);
    const cleanedActualHash = await removePrefix(actualHashValue);
    const cleanedSecretKey = await removePrefix(secretKeyValue);
    const isGuessHashValid = await isValidChar(cleanedGuessHash);
    const isActualHashValid = await isValidChar(cleanedActualHash);
    const isSecretKeyValid = await isValidChar(cleanedSecretKey);

    if (blockIncrementCount < 513 || blockIncrementCount > 2048) {
        errors.push('Please enter a valid block number between 513 and 2048');
    }
    if (tokenSize < 3 || tokenSize > 64) {
        errors.push('Please enter a valid token size between 3 and 64');
    }
    if (dummyHash && !isGuessHashValid) {
        errors.push('Dummy hash must be a valid 64-character hexadecimal string.');
    }
    if (dummyHash && !isGuessHashValid) {
        errors.push('Dummy hash must be a valid 64-character hexadecimal string.');
    }
    if (actualHash && !isActualHashValid) {
        errors.push('Actual hash must be a valid 64-character hexadecimal string.');
    }
    if (secretKey && !isSecretKeyValid) {
        errors.push('Secret key Hash must be a valid 64-character hexadecimal string.');
    }
    if (secretKey && !isSecretKeyValid) {
        errors.push('Secret key Hash must be a valid 64-character hexadecimal string.');
    }
    if(overWrite == 'false' ){
        errors.push('Cannot submit the form with overwrite is false');

    }
    const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
if (dummyHash === zeroHash) {
    errors.push('Dummy hash cannot be the default zero value.');
}
if (tokenSize == 0 ) {
    errors.push('Token Size cannot be  zero.');
}
if (actualHash === zeroHash) {
    errors.push('Actual hash cannot be the default zero value.');
}
if (secretKey === zeroHash) {
    errors.push('Secret key cannot be the default zero value.');
}
    // Validate Block_Increment_Count and Token_Size as numbers
    if (formValues.Block_Increment_Count && isNaN(formValues.Block_Increment_Count)) {
        errors.push('Block Increment Count must be a number.');
    }
    if (formValues.Token_Size && isNaN(formValues.Token_Size)) {
        errors.push('Token Size must be a number.');
    }
    // Display errors if any
    if (errors.length > 0) {
        Swal.fire({
            title: 'Validation Errors',
            html: `<ul>${errors.map(err => `<p>${err}</p>`).join('')}</ul>`,
            icon: 'error',
        });
        return;
    }
    let paymentPaidBet;
    if (formValues.paid_guess === "false") {
        paymentPaidBet = 0; // Free guess
    } else {
        paymentPaidBet = Number(25000000000000000000); // Paid guess
    }

    const customData = {
    Sno: Number(formValues.guessId),
    blockIncrementCount: Number(formValues.Block_Increment_Count),
    blockHashGuess: formValues.dummyHash,
    tokenSize: Number(formValues.Token_Size),
    paymentPaidBet: paymentPaidBet, 
    overWrite: Boolean(formValues.overwrite) ,
    complex: formValues.complex == 'true' ? true : false,
    dummyHash: formValues.dummyHash,
    actualHash: formValues.actualHash,
    secretKey: formValues.secretKey
    };    
    try {
        const submitResponse = await submitGuessData(
            customData.Sno,
            customData.blockIncrementCount,
            customData.blockHashGuess,
            customData.tokenSize,
            customData.paymentPaidBet,
            customData.overWrite,
            customData.complex,
            customData.actualHash,
            customData.secretKey,
            customData.dummyHash
        );
        if (submitResponse && submitResponse.success) { 
           
            Swal.fire({
                title: 'Success!',
                text: 'Form submitted successfully!',
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } else {
            toastr.error("error occurred while submitting the form");
        }
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while submitting the form.',
            icon: 'error',
        });
        toastr.error("error occurred while submitting the form");
    }
}

// submit the guess data to infura 
async function submitGuessData(SNo, blockNumber, blockHashGuess, tokenSize, paymentPaidBet, overWrite, complex, actualHash, secretKey, dummyHash) { 
    // Logic Contract
    const submitBtn = document.getElementById("submitNewGuess");
    try {
        submitBtn.innerHTML = "Submitting ....";
        submitBtn.disabled = true;
        const deGuessWalletInst = await initContractInstance("logic", "wallet");
        console.log(currentAccount, npWallet);
        const estimatedGas = await deGuessWalletInst.methods.submitBlockGuess(
            SNo,
            blockNumber,
            blockHashGuess,
            tokenSize,
            paymentPaidBet,
            overWrite,
            complex
        ).estimateGas({ from: currentAccount });
        const adjustedGas = Number(BigInt(estimatedGas) * 200n / 100n);
        // const result = await deGuessWalletInst.methods.submitBlockGuess(
        //     SNo,
        //     blockNumber,
        //     blockHashGuess,
        //     tokenSize,
        //     paymentPaidBet,
        //     overWrite,
        //     complex
        // ).send({ from: currentAccount, gas: adjustedGas })
        const result = await deGuessWalletInst.methods.submitBlockGuess(
            SNo,
            blockNumber,
            blockHashGuess,
            tokenSize,
            paymentPaidBet,
            overWrite,
            complex
        ).send({ from: currentAccount })
        .on('transactionHash', function (hash) { 
            showAlert("Transaction yet to be confirmed. Don't refresh the page.", "info")
         })
        // .on('confirmation', function (confirmationNumber, receipt) {  })
        .on('receipt', function  (receipt) { 
            if (receipt.status) {
                const events = receipt.events;
                if (events && events.guessSubmitted) {      
                    const emittedValues = events.guessSubmitted.returnValues;
                    if ((currentAccount).toLowerCase() == (emittedValues._userAddress).toLowerCase() && Number(emittedValues._guessBlockNumber) != 0) {
                        // Check all ==> _placedBy, _guessSNo, _guessBlockNo, _guessTokenSize, _paidGuess, _complexGuess values with user entered values
                        // Update UI: Guess Placed Successfully!!
                        toastr.success("Guess PlacedSuccessfully");
                        let isFreeGuess = paymentPaidBet !== 0 ? true : false;
                        updateFireBaseData(SNo, "place_new_guess", {guessId : SNo, paidGuess: isFreeGuess , tokenSize: tokenSize, complex: complex, actualHash: actualHash, secretKey: secretKey,  dummyHash: dummyHash });
                        submitBtn.innerHTML = "Submit";
                        submitBtn.disabled = false;
                        return true;
                    } else { toastr.error("Incorrect Guess Data returned"); }
                } else {
                    // Update UI: Guess Submission failed!!
                    toastr.error("Guess Submission Failed!!");
                    submitBtn.innerHTML = "Submit";
                    submitBtn.disabled = false;
                    return false;
                }
            } else {
                // Update UI: Transaction failed
                submitBtn.innerHTML = "Submit";
                submitBtn.disabled = false;
                toastr.error("No Guess Submitted event found in the receipt.");
                return false;
            }
        })
        .on('error', function (error) {
          alert("Error Message ", error); 
        });

        return { success: true };

    } catch (error) {
        submitBtn.innerHTML = "Submit";
        submitBtn.disabled = false;
        if (error.message.includes("User denied transaction signature") || error.code == 4001) {
            toastr.error("User denied transaction signature.");
        }
        else if (error.message.includes("Internal JSON-RPC error") || error.code == -32603) { toastr.error("Please Increase Gas fee! Also Check gas, network settings!"); }
          else if (error.message.includes("revert")) { toastr.error("Transaction reverted. Contract conditions failed."); }
         else {
            toastr.error("Error submitting transaction");
        }
    }
}

// function for clear the form
function clearForm (){
    window.location.reload();
}

// verify Off Chain page function
// get the guess data and show UI in guess verification page (UI )
async function getSeedData () {
    const [netStatus, statusMsg] = await walletNetworkConfig();
    if(!netStatus) {  return false; }
    const seedData = JSON.parse(localStorage.getItem('singleGuess'));
    if (!seedData) {
        toastr.error("Can't retrieved the Guess data");
    } else {
      const seedBody = document.querySelector('.populateSeed'); 
      // Use querySelector for class
      if (seedBody) {
        const row = `
          <div class="row mb-3">
            <div class="col-sm-12 col-xs-12">
              <div class="label-name">
                <label>Guess ID</label>
              </div>
              <div class="label-value">
                <label>${seedData.guessId || 'N/A'}</label>
              </div>
            </div>
            <div class="col-sm-3 col-xs-12">
              <div class="label-name">
                <label>Target Block Count</label>
              </div>
              <div class="label-value">
                <label>${seedData.targetBlockNumber || 'N/A'}</label>
              </div>
            </div>
            <div class="col-sm-3 col-xs-12">
              <div class="label-name">
                <label>Token Size</label>
              </div>
              <div class="label-value">
                <label>${seedData.tokenSize || 'N/A'}</label>
              </div>
            </div>
            <div class="col-sm-2 col-xs-12">
              <div class="label-name">
                <label>Paid Guess</label>
              </div>
              <div class="label-value">
                <label class="${seedData.paidGuess ? 'badge bg-success' : 'badge bg-danger'}">
                  ${seedData.paidGuess}
                </label>
              </div>
            </div>
            <div class="col-sm-2 col-xs-12">
              <div class="label-name">
                <label>Complex</label>
              </div>
              <div class="label-value">
                <label>
                  <span class="${seedData.complex ? 'badge bg-success' : 'badge bg-danger'}">
                    ${seedData.complex }
                  </span>
                </label>
              </div>
            </div>
            <div class="col-sm-12 col-xs-12">
              <div class="label-name">
                <label>Actual Hash</label>
              </div>
              <div class="label-value">
                <label class="word-break text-success">${seedData.actualHash || ''}</label>
              </div>
            </div>
             <div class="col-sm-12 col-xs-12">
              <div class="label-name">
                <label>Secret Key</label>
              </div>
              <div class="label-value">
                <label class="word-break text-danger">${seedData.secretKey || ''}</label>
              </div>
            </div>
             <div class="col-sm-12 col-xs-12 mb-5">
              <div class="label-name">
                <label>Dummy Hash</label>
              </div>
              <div class="label-value">
                <label class="word-break text-danger">${seedData?.userHashGuess || ''}</label>
              </div>
            </div>
          </div>
        `;
        seedBody.insertAdjacentHTML('beforeend', row);
      } else {
       
      }
    }
     const fetchButton = document.querySelector('#fetchGen')
     fetchButton.addEventListener('click', () =>{fetchGeneratedHash(seedData.guessId);})
     const verifyOffbtn = document.querySelector('#verifyOff');
     verifyOffbtn.addEventListener('click', () =>{ 
    const inputElement = document.getElementById('generated-hash');
    const getGeneratedHashInputValue = inputElement.value.trim(); // Remove extra spaces
    if (!getGeneratedHashInputValue) {
        Swal.fire({
            title: "Error",
            text: "Generated Hash cannot be empty. Please enter a value.",
            icon: "error",
            button: "OK"
        });
        return false; 
    }
    const hex2 = seedData.actualHash;
    const token = seedData.tokenSize
    compareHexValues(getGeneratedHashInputValue, hex2, token)});
}

// fuction for check the block range and fetch the generated hash from infura (return hash)
async function fetchGeneratedHash(_SNo){
    const [netStatus, statusMsg] = await walletNetworkConfig();
    if(!netStatus) {  return false; }
     document.getElementById('fetchGen').innerHTML = 'Fetching';
    try {
        const deGuessInfuraInst = await initContractInstance("logic", "infura");
        const guessData = await deGuessInfuraInst.methods.getGuessEntry(_SNo).call({ from: currentAccount });
        if(!guessData) { toastr.error("unable to fetch the Guess Data"); return [null, "unable to fetch the Guess Data"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
        if(guessData.targetVerified == "verified" || Number(guessData.targetVerified) == 2) { 
            toastr.error("Guess Already Verified");
            return [null, "Guess Verified Already"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
        if(guessData.targetVerified == "empty" || Number(guessData.targetVerified) == 0) { 
            toastr.error("Guess is empty");
            return [null, "guess is Empty"];
        }
        const targetBlockNumber = guessData.targetBlockNumber;
        const currentBlockNumber = await npInfura.eth.getBlockNumber();
        const blockDistance = Number(currentBlockNumber) - Number(targetBlockNumber);
        // toastr.info("Guess Placed Block Distance from the current Block" + blockDistance )
        let targetBlockHash;
        const fetchBtn = document.getElementById('fetchGen').innerHTML = 'Fetch generated hash ';
        if(blockDistance <= -1) { toastr.error("Block yet to be mined"); return [null,"Block yet to be mined"]; }
            if(!guessData.complex) {
                if (blockDistance <= 255) {   
                   let blockRangeIndication = "";
                   if(blockDistance <= 64) { blockRangeIndication = "dark green";  toastr.info(`Block Indication: ${blockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#006400"); }
                   if(blockDistance > 64 && blockDistance <= 128) { blockRangeIndication = "light green"; toastr.info(`Block Indication: ${blockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#90EE90"); }
                   if(blockDistance > 128 && blockDistance <= 192) { blockRangeIndication = "light red";  toastr.info(`Block Indication: ${blockRangeIndication}, Block Distance: ${blockDistance}`);  $(".toast-info").css("background-color", "#FF7F7F"); }
                   if(blockDistance > 192) { blockRangeIndication = "dark red";toastr.info(`Block Indication: ${blockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#8B0000");  }
                    
                    const block = await npInfura.eth.getBlock(targetBlockNumber);
                    if (block && block.hash != null && block.hash != undefined) { targetBlockHash = block.hash; 
                        document.getElementById('generated-hash').value = targetBlockHash;
                        localStorage.setItem('block-hash-generated', targetBlockHash);
                        return [targetBlockHash, blockRangeIndication];
                        /* Update UI: Hash and Colour*/ }
                    else{ toastr.error("Block hash retrieve issue");  return [null, "Block hash retrieve issue"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }

                } else { 
                    toastr.error("Block out of range"  + 'Block Distance -' + blockDistance,);
                    return [null, "Block out of range"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
            }
            if (guessData.complex) {
                if (blockDistance <= 128) {
                    let ranblockRangeIndication = "";
                    if(blockDistance <= 32) { ranblockRangeIndication = "dark green";  toastr.info(`Block Indication: ${ranblockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#006400");}
                    if(blockDistance > 32 && blockDistance <= 64) { ranblockRangeIndication = "light green";  toastr.info(`Block Indication: ${ranblockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#90EE90");}
                    if(blockDistance > 64 && blockDistance <= 96) { ranblockRangeIndication = "light red";toastr.info(`Block Indication: ${ranblockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#FF7F7F");  }
                    if(blockDistance > 96) { ranblockRangeIndication = "dark red";toastr.info(`Block Indication: ${ranblockRangeIndication}, Block Distance: ${blockDistance}`); $(".toast-info").css("background-color", "#8B0000");}
                
                    const block = await npInfura.eth.getBlock(targetBlockNumber);
                    if (block && block.hash != null && block.hash != undefined) { 
                        targetBlockHash = block.hash; }
                    else {
                        toastr.error("Random Block hash retrieve issue");
                         return [null, "Random Block hash retrieve issue"]; 
                     }
                    const [randomBlockHash, byteHex, adjustedRanBlockPos, randomBlockNumber] = await getRandomBlockHash(targetBlockHash, targetBlockNumber); 
                    await displayComplexCalculation(targetBlockNumber, targetBlockHash, byteHex, adjustedRanBlockPos,randomBlockNumber,randomBlockHash);     
                    if (randomBlockHash != null && randomBlockHash != undefined) {
                        document.getElementById('generated-hash').value = randomBlockHash;
                        localStorage.setItem('block-hash-generated', randomBlockHash);
                        document.getElementById("complexGuessCalculation").classList.remove('d-none'); 
                         return [randomBlockHash, ranblockRangeIndication]; }
                    else {
                        toastr.error("Random Block hash retrieve issue");
                         return [null, "Random Block hash retrieve issue"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
                } else {  
                    document.getElementById('fetchGen').innerHTML = 'Fetch generated hash ';
                    toastr.error("Block out of range"  + 'Block Distance -' + blockDistance,);
                    return  [null, "Block out of range"]; /* Update UI: As 0x0...0 in Generated Hash Textbox */ }
            }
    } catch (error) { document.getElementById('fetchGen').innerHTML = 'Fetch generated hash ';  toastr.error("Error fetching guess entry") /* Update UI: Error while fetching guess data */ }
}

// complex guess calculation description (UI)
async function displayComplexCalculation(
    targetBlockNumber,
    targetBlockHash,
    byteHex,
    adjustedRanBlockPos,
    randomBlockNumber,
    randomBlockHash
  ) {
    // Update all elements with class "displayTargetBlockNumber"
    const showBlockNumber = document.querySelectorAll(".displayTargetBlockNumber");
    showBlockNumber.forEach((item) => {
      item.innerHTML = Number(targetBlockNumber);
    });
  
    // Update individual elements by ID
    document.getElementById("displayAdjRanBlockPos").innerHTML = adjustedRanBlockPos;
    document.getElementById("displayRandomBlockNumber").innerHTML = randomBlockNumber;
    document.getElementById("displayRandomHash").innerHTML = randomBlockHash;
    document.getElementById("displayTargetBlockHash").innerHTML = targetBlockHash;
  
    // Process targetBlockHash for display
    let processedBlockHash = targetBlockHash;
    if (processedBlockHash.startsWith("0x")) {
      processedBlockHash = processedBlockHash.slice(2);
    }
  
    // Highlight specific part of the hash
    const highlightStart = 30;
    const highlightEnd = 32;
    const displayByteHex = processedBlockHash.slice(highlightStart, highlightEnd);
    const highlightedHash ="0x"+
      processedBlockHash.slice(0, highlightStart) +
      "<span class='text-success'>" +
      displayByteHex +
      "</span>" +
      processedBlockHash.slice(highlightEnd);
  
    // Update the HTML element for displaying the highlighted hash
    const hashDisplayElement = document.getElementById("displayTargetBlockHash");
    if (hashDisplayElement) {
      hashDisplayElement.innerHTML = highlightedHash;
    } else {}
  
}
  
  // fuction for comparing hex values (return the matches array)
async function compareHexValues(hex1, hex2, _tokenSize) {
    hex1 = hex1.toLowerCase();
    hex2 = hex2.toLowerCase();
    hex1 = await removePrefix(hex1);
    hex2 = await  removePrefix(hex2);
    const tokenSize = parseInt(_tokenSize, 10);
    
    if (!isValidChar(hex1) || !isValidChar(hex2)) {
        // alert("Both hex strings must be valid 64-character hexadecimal strings.");
        toastr.error("Both hex strings must be valid 64-character hexadecimal strings."); 
        return [];
    }
    if (tokenSize < 3 || tokenSize > 64) { // Minimum Token Size to be changed as 4 in Production Mode
        // alert("Token size must be between 4 and 64.");
        toastr.error("Token size must be between 4 and 64."); 
        return [];
    }
    const tokens1 = await tokenize(hex1, tokenSize);
    const tokens2 = await  tokenize(hex2, tokenSize);
    const matches = [];
    tokens1.forEach((token1, i) => {
        tokens2.forEach((token2, j) => {
            if (token1 === token2) {
                const hitHex1 = {
                    startByte: Math.floor(i / 2),
                    endByte: Math.floor((i + tokenSize - 1) / 2),
                    leftSkip: i % 2 !== 0,
                    rightSkip: (i + tokenSize) % 2 !== 0
                };
                const hitHex2 = {
                    startByte: Math.floor(j / 2),
                    endByte: Math.floor((j + tokenSize - 1) / 2),
                    leftSkip: j % 2 !== 0,
                    rightSkip: (j + tokenSize) % 2 !== 0
                };
                matches.push({
                    token: token1,
                    hex1: hitHex1,
                    hex2: hitHex2,
                    encoded: encodeMatch(hitHex1, hitHex2)
                });
            }
        });
    });
    localStorage.setItem('matches', JSON.stringify(matches));
    window.location.href ='/matches-found.html';
    return matches;
}

//  Matches page functions
// Function to show matches in the matches page
async function matchedData() {
    const singleData = JSON.parse(localStorage.getItem("singleGuess"));
    if(singleData){
        const [netStatus, statusMsg] = await walletNetworkConfig();
        if (!netStatus) {return false; }
    }
    const matchesContainer = document.getElementById('matches');
    const matchedArray = JSON.parse(localStorage.getItem('matches')) || [];
    if(matchedArray){await highlightMatches(matchedArray, singleData)}
    const blockHash = localStorage.getItem('block-hash-generated');
    document.getElementById('secret-key').innerHTML = singleData.secretKey || '';
    document.getElementById('dummy-hash').innerHTML = singleData.userHashGuess || '';
    document.getElementById('matchCount').innerHTML = matchedArray.length;
    if (!matchesContainer) {
        toastr.error('Element with id "matches" not found!');
        return;
    }
    // Handle the case where there are no matches
    if (matchedArray.length === 0) {
        document.getElementById('matchHeading').classList.remove('d-none');
        const noMatchesHtml = `
           <div class="card no-match"  >
                  <div class="card-body">
                     <div class="bg-circle">
                       
                        <h4>No match</h4>
                     </div>
                     <div class="form-check d-flex aligin-items-center match-checkbox">
                        <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" >
                        <label class="form-check-label" for="flexCheckChecked">
                          <strong>0</strong>
                        </label>
                      </div>
                  </div>
               </div>
               <div class="card no-match"  >
                  <div class="card-body">
                     <div class="bg-circle">
                       
                        <h4>No match</h4>
                     </div>
                     <div class="form-check d-flex aligin-items-center match-checkbox">
                        <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" >
                        <label class="form-check-label" for="flexCheckChecked">
                          <strong>0</strong>
                        </label>
                      </div>
                  </div>
               </div>
        `;
        matchesContainer.insertAdjacentHTML('beforeend', noMatchesHtml);
        return;
    }
    // Render matched data
    matchedArray.forEach((item, index) => {
        const cardClass = (index < 2) ? 'matched' : '';
        const matchHtml = `
            <div class="card ${cardClass}" style="display: block;">
                <div class="card-body">
                    <div class="bg-circle">
                        <span><i class="bi bi-patch-check-fill"></i></span>
                        <h4>Match ${index + 1}</h4>
                    </div>
                    <div class="form-check d-flex align-items-center match-checkbox">
                       <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked${index}" ${index < 2 ? 'checked' : ''}>
                        <label class="form-check-label" for="flexCheckChecked${index}">
                            <strong>Match ${index + 1}</strong>  <strong>: ${item.token}</strong> 
                        </label>
                    </div>
                    <div class="d-flex mt-50">
                        <div>
                            <p class="card-text">${blockHash}</p>
                            <hr>
                            <p class="card-text">${singleData.actualHash}</p>
                        </div>
                    </div>
                    <div class="hex-values">
                        <span class="hex-label">Hex 1</span>
                        <div class="row">
                            <div class="col-sm-6 col-lg-3">
                                <p>Start Byte</p>
                                <p>${item.hex1.startByte}</p>
                            </div>
                            <div class="col-sm-6 col-lg-3">
                                <p>End Byte</p>
                                <p>${item.hex1.endByte}</p>
                            </div>
                            <div class="col-sm-6 col-lg-3">
                                <p>Left Skip</p>
                                <p class="${item.hex1.leftSkip ? 'true' : 'false'}">${item.hex1.leftSkip}</p>
                            </div>
                            <div class="col-sm-6 col-lg-3">
                                <p>Right Skip</p>
                                <p class="${item.hex1.rightSkip ? 'true' : 'false'}">${item.hex1.rightSkip}</p>
                            </div>
                        </div>
                    </div>
                    <div class="hex-values">
                        <span class="hex-label">Hex 2</span>
                        <div class="row">
                            <div class="col-sm-6 col-lg-3">
                                <p>Start Byte</p>
                                <p>${item.hex2.startByte}</p>
                            </div>
                            <div class="col-sm-6 col-lg-3">
                                <p>End Byte</p>
                                <p>${item.hex2.endByte}</p>
                            </div>
                            <div class="col-sm-6 col-lg-3">
                                <p>Left Skip</p>
                                <p class="${item.hex2.leftSkip ? 'true' : 'false'}">${item.hex2.leftSkip}</p>
                            </div>
                            <div class="col-sm-6 col-lg-3">
                                <p>Right Skip</p>
                                <p class="${item.hex2.rightSkip ? 'true' : 'false'}">${item.hex2.rightSkip}</p>
                            </div>
                        </div>
                    </div>
                    <div class="hex-values">
                        <span class="hex-label">Encoded Data</span>
                        <div class="row">
                            <p class="text" style="text-align: left;" data-index="${index}">
                                ${item.encoded.slice(0, 200)}
                            </p>
                            <span class="toggleButton" data-index="${index}">Show More</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Append the generated HTML to the container
        matchesContainer.insertAdjacentHTML('beforeend', matchHtml);
    });

    // Add toggle functionality for all toggle buttons
matchesContainer.querySelectorAll('.toggleButton').forEach(button => {
    button.addEventListener('click', () => {
        const index = button.dataset.index;
        const textElement = matchesContainer.querySelector(`.text[data-index="${index}"]`);
        const isExpanded = button.textContent === 'Show Less';

        // Toggle between full and truncated text
        if (isExpanded) {
            textElement.textContent = matchedArray[index].encoded.slice(0, 200);
            button.textContent = 'Show More';
        } else {
            textElement.textContent = matchedArray[index].encoded;
            button.textContent = 'Show Less';
        }
    });
});
    // Submit button event listener
    const submitButton = document.getElementById('SubmitVerify');
    submitButton.addEventListener('click', async() => {
        const selectedMatches = [];
        matchedArray.forEach((item, index) => {
            const checkbox = document.getElementById(`flexCheckChecked${index}`);
            if (checkbox && checkbox.checked) {
                selectedMatches.push(item);
            }
        });

        if (selectedMatches.length > 2) {
            Swal.fire({
                icon: 'warning',
                title: 'Too Many Selections',
                text: 'You can only select up to two matches.',
                confirmButtonText: 'Okay'
            });
            
            return false; // Exit the function if more than two items are selected
        } else if(selectedMatches.length == 0){
            Swal.fire({
                icon: 'warning',
                title: 'Please select at least one match',
                confirmButtonText: 'Okay'
            });
            return false; // Exit the function if more than two items are selected
        }
        else{
            const preparedData = {
                SNO: singleData.guessId,
                code_1: selectedMatches[0]?.encoded,
                actualHash: singleData.actualHash,
                secretKey: singleData.secretKey,
                code_2: selectedMatches[1]?.encoded ? selectedMatches[1]?.encoded : '0x',
            };
             submitButton.innerHTML='Verify'
            await verifyGuessData(preparedData.SNO, preparedData.actualHash, preparedData.secretKey, preparedData.code_1, preparedData.code_2);
            return true;
        }
    });
}

// Function for highlighting matches token in hex values (UI)
async function highlightMatches (matchedArray, singleData) {

    const blockHash = localStorage.getItem('block-hash-generated');
    const string1 = document.getElementById('block-hash-generated').innerHTML = blockHash || '';
    const string2 =document.getElementById('actual-hash').innerHTML = singleData.actualHash || '';

    // Extract token values from the objects in the array
    const tokens = matchedArray.map(obj => obj.token);
    
    // Global color map to store a unique color for each token
    const colorMap = {};
    
    // Function to generate a random RGBA color
    function getRandomRGBA() {
      const r = Math.floor(Math.random() * 256); // Random red value (0-255)
      const g = Math.floor(Math.random() * 256); // Random green value (0-255)
      const b = Math.floor(Math.random() * 256); // Random blue value (0-255)
      const a = (Math.random() * 0.5 + 0.5).toFixed(2); // Random alpha value between 0.5 and 1
    
      return `rgba(${r}, ${g}, ${b}, ${a})`; // Return the RGBA string
    }
    
    // Function to highlight tokens in a string and replace <mark> with <span>
    function highlightString(inputString, tokens) {
      // Create a regex pattern from the tokens array
      const regex = new RegExp(tokens.join("|"), "g");
    
      // Replace tokens in the string with <span> tags, applying the same color for repeated tokens
      return inputString.replace(regex, match => {
        // If the token has been seen before, reuse the color, otherwise generate a new color
        if (!colorMap[match]) {
          colorMap[match] = getRandomRGBA(); // Assign a random color to the token
        }
        return `<span style="background-color: ${colorMap[match]};">${match}</span>`;
      });
    }
    
    // Apply the function to both strings
    const highlightedString1 = highlightString(string1, tokens);
    const highlightedString2 = highlightString(string2, tokens);

    // Display the highlighted strings in the HTML
    document.querySelector('#block-hash-generated').innerHTML = highlightedString1;
    document.querySelector('#actual-hash').innerHTML = highlightedString2;
}

// Function for verifying matches (return rewards )
async function verifyGuessData(SNo, _actualHash, _secretKey, _encMatchData1, _encMatchData2) { // Logic Contract
    const submitButton = document.getElementById('SubmitVerify');
    submitButton.innerHTML='Verifying...';
    submitButton.disabled = true;
    try {
	    const deGuessInfuraInst = await initContractInstance("logic", "infura");
        const guessData = await deGuessInfuraInst.methods.getGuessEntry(SNo).call({ from: currentAccount });

		const generatedDummyHash = await getUnrevealedHash(_actualHash, _secretKey);
		if (guessData.userHashGuess !== generatedDummyHash) { toastr.error("Dummy Hash & Actual Hash Mismatch!"); return false; }
		
        const deGuessWalletInst = await initContractInstance("logic", "wallet");
        const estimatedGas = await deGuessWalletInst.methods.verifyBlockGuess(SNo, _actualHash, _secretKey, [_encMatchData1, _encMatchData2]).estimateGas({ from: currentAccount });

        const adjustedGas = Number(BigInt(estimatedGas) * 200n / 100n);
   
        const result = await deGuessWalletInst.methods.verifyBlockGuess(SNo, _actualHash, _secretKey, [_encMatchData1, _encMatchData2])
        .send({ from: currentAccount})
        .on('transactionHash', function (hash) { showAlert("Transaction yet to be confirmed. Don't refresh the page.", "info");})
        // .on('confirmation', function (confirmationNumber, receipt) {  })

        .on('receipt', function  (receipt) { 
            if (receipt.status) {
                const events = receipt.events;
                if (events && events.guessVerified) {
                    const emittedValues = events.guessVerified.returnValues;
                    const totalRewardsReceived = npInfura.utils.fromWei(emittedValues._rewardsTotal, 'ether');
                    if ((currentAccount).toLowerCase() == (emittedValues._userAddress).toLowerCase() && 
                   (emittedValues._targetStatus == 'verified' || Number(emittedValues._targetStatus) == 2)) {
                        // Check all ==>  _placedBy, _guessSNo, guessRewardsAmt, guessVerified with values generated offline for user entered guess
                        // Update UI: Guess Verified Successfully!!
                        if(Number(emittedValues._rewardsTotal) > 0) {
                            toastr.success('Rewards Received :' + totalRewardsReceived);
                            } 
                        else {toastr.error('failed :' + totalRewardsReceived);
                         }
                        showAlert("Guess Verified Successfully!", "success");
                        updateFireBaseData(SNo, "update_guess_verify", { targetVerified: 2});
                        submitButton.innerHTML='Verify on Chain';
                        submitButton.disabled = false;
                        return true;
                    } else { toastr.error("Incorrect Guess Data returned");}
                } else {
                    // Update UI: Guess Verification failed!!
                    toastr.error("Guess Verification Failed!!");
                    submitButton.innerHTML='Verify on Chain';
                    submitButton.disabled = false;
                    return false;
                }
            } else {
                // Update UI: Guess Verification failed
                submitButton.innerHTML='Verify on Chain';
                submitButton.disabled = false;
                toastr.error("No Guess Verified event found in the receipt.");
                return false;
            }
        })
        .on('error', function (error) {
            if (error.code === 4001) {toastr.error("User rejected the transaction");}
            else { }
        });
        submitButton.innerHTML='Verify on Chain';
        submitButton.disabled = false;
    } catch (error) {
        submitButton.innerHTML='Verify on Chain';
        submitButton.disabled = false;
        toastr.error("Error verifying block guess"); 
        if (error.message.includes("User denied transaction signature") || error.code == 4001) {toastr.error("User denied transaction signature.");}
        else if (error.message.includes("Internal JSON-RPC error") || error.code == -32603) { toastr.error("Please Increase Gas fee! Also Check gas, network settings!"); }
          else if (error.message.includes("revert")) { toastr.error("Transaction reverted. Contract conditions failed."); }
         else {
            toastr.error("Error submitting transaction");
        }
        throw error;
    }
}

// function for  logout the user
async function userLogOut() {
    // Clear session and local storage
    localStorage.clear();
    // Reset account and address variables
    currentAccount = 0;
    logicCrtAddress = '0x';
    await provider.request({
        method: "wallet_revokePermissions",
        params: [
        {
            eth_accounts: {},
        },
        ],
    })
    // Redirect to session page
    toastr.error("Logged Out. Redirecting to Log in Page...");
    window.location.href = '/session.html';  // Ensure this path is correct
}

// Shared event listeners
function setupSharedListeners() {
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', userLogOut);
    }

    const myForm = document.getElementById('myForm');
    if (myForm) {
        myForm.addEventListener('submit', OnFormSubmit);
    }

    const overwrite = document.getElementById('overwrite');
    if (overwrite) {
        overwrite.addEventListener("change", OnOverwriteChange);
    }
}

// Setup event listeners for old-data.html
function setupHashEventListeners() {
    const actualHashInput = document.querySelector('#actualHash');
    const secretKeyInput = document.querySelector('#secretKey');

    if (actualHashInput) {
        actualHashInput.addEventListener('change', async (e) => {
            await checkOnChangeActualHash(e);
            generateDummyHash();
        });
    }

    if (secretKeyInput) {
        secretKeyInput.addEventListener('change', async (e) => {
            await checkOnChangeSecretKey(e);
            generateDummyHash();
        });
    }
    const actualHashButton = document.querySelector('.actual-hash-btn');
    const secretButton = document.querySelector('.secret-btn');

    if (actualHashButton) {
        actualHashButton.addEventListener('click', generateDummyHash);
    }
    if (secretButton) {
        secretButton.addEventListener('click', generateDummyHash);
    }
}

// check the login status  and update logicCrtAddress & currentAccount in localStorage
function IsLoggedIn(){
    const token = localStorage.getItem('logicCrtAddress');
    const auth = localStorage.getItem('auth');
    const getCurrentAccount = localStorage.getItem('currentAccount');
    if ( token !== '' && auth !== false && currentAccount !== '' ){
        logicCrtAddress = token;
        currentAccount = getCurrentAccount;
        return true;
    }
    toastr.error("Cannot store account");
    return false;
}

// firebase operations

// Function to check if the table exists
async function fireBaseTableStatus(currentAccount) {
    try {
      const dbRef = ref(database, currentAccount); // Reference to the table
      const snapshot = await get(dbRef); // Await snapshot retrieval
      return snapshot.exists(); // Return true if table exists, false otherwise
    } catch (error) {
      toastr.error("Error checking table status: " + error);
      return false;
    }
}

//function to check missing fields
async function fireBaseFieldStatus(_SNo) {
    try {
       const _fieldAHPath = 'row' + _SNo + '/actualHash';
      const dbAHFieldRef = ref(database, `${currentAccount}/` + _fieldAHPath);
      const snapshotActualHash = await get(dbAHFieldRef);
      const actualHashExists = snapshotActualHash.exists();
      const _fieldSKPath = 'row' + _SNo + '/secretKey';
      const dbSKFieldRef = ref(database, `${currentAccount}/` + _fieldSKPath);
      const snapshotSecretKey = await get(dbSKFieldRef);
      const secretKeyExists = snapshotSecretKey.exists();
      if(!actualHashExists || !secretKeyExists)  { return false; }
      else { return true; }
  
    } catch (error) {
      toastr.error("Error checking field status");
      return false;
    }
}

// Function to create a new Firebase table if it doesn't exist
async function createFireBaseTable(currentAccount) {
    try {
      const tableExists = await fireBaseTableStatus(currentAccount); // Check table existence
      if (!tableExists) {
        // Define the structure for the initial data
        const initialData = {
          row1: {
            guessId: 1,
            paidGuess: Boolean(false),
            targetBlockNumber: 0,
            targetVerified: "unverified",
            tokenSize: 0,
            complex: Boolean(false),
            dummyHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            actualHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            secretKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
          },
       
          row2: {
                guessId: 2,
                paidGuess: Boolean(false),
                targetBlockNumber: 0,
                targetVerified: "unverified",
                tokenSize: 0,
                complex: Boolean(false),
                dummyHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                actualHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                secretKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
          },
          
          row3: {
                guessId: 3,
                paidGuess: Boolean(false),
                targetBlockNumber: 0,
                targetVerified: "unverified",
                tokenSize: 0,
                complex: Boolean(false),
                dummyHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                actualHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                secretKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
          },
              
          row4: {
                guessId: 4,
                paidGuess: Boolean(false),
                targetBlockNumber: 0,
                targetVerified: "unverified",
                tokenSize: 0,
                complex: Boolean(false),
                dummyHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                actualHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                secretKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
          },
              
          row5: {
                guessId: 5,
                paidGuess: Boolean(false),
                targetBlockNumber: 0,
                targetVerified: "unverified",
                tokenSize: 0,
                complex: Boolean(false),
                dummyHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                actualHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                secretKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
          } 
        };
  
        // Set the initial data
        const dbRef = ref(database, currentAccount); // Reference to 'guesstable'
        await set(dbRef, initialData); // Create the table with initial data
  
        toastr.success("New table created successfully!");
        // alert("New table created successfully!");
        return [true, initialData];
      } else {
        toastr.info("Table already exists!");
        // alert("Creating new table was failed! Table already exists.");
        return [false, null];
      }
    } catch (error) {
      toastr.error("Failed to create table");
      return [false, null];
    }
}

// Function to get guess entries and add them to firebase table
async function loginForRegUsers() { // Logic Contract
    const [netStatus, statusMsg] = await walletNetworkConfig();
    if(!netStatus) { return false; }
    try {
        const poolSize = 5; // Poolsize has to be adjusted with Token Contract's actual Pool Size
       
        const deGuessInfuraInst = await initContractInstance("logic", "infura");
        let guessEntries = {}; // 'Populate' temproary object
        for (let SNo = 1; SNo <= poolSize; SNo++) {
          const guessData = await deGuessInfuraInst.methods.getGuessEntry(SNo).call({ from: currentAccount });
          const modifiedGuessData = {
            ...guessData,
            guessId: SNo,
          };
          for (const key in modifiedGuessData) {
            modifiedGuessData[key] = convertBigIntToNumber(modifiedGuessData[key]);
          }
          guessEntries[SNo] = modifiedGuessData;
          await updateFireBaseData(SNo, "login", modifiedGuessData); //Update Firebase data withe smart contract data
          const fieldExists = await fireBaseFieldStatus(SNo);
          if(!fieldExists){
            const missingFields =  {actualHash: "0x0000000000000000000000000000000000000000000000000000000000000000", 
                secretKey:"0x0000000000000000000000000000000000000000000000000000000000000000" }
            await updateFireBaseData(SNo, "field_insertion", missingFields); // Create table if not exists
          }
        }
        let misMatchIds = [];
        for (let rowNo = 1; rowNo <= poolSize; rowNo++) {
          const [match, [actualHash, secretKey]] = await compareDummyActualHashes(rowNo);
          guessEntries[rowNo].actualHash = actualHash; //Update 'Populate' temproary object with Firebase data
          guessEntries[rowNo].secretKey = secretKey; //Update 'Populate' temproary object with Firebase data 
          if (!match){ misMatchIds.push(rowNo);
            } 
        }
        if(misMatchIds.length != 0) { await populateTable(Object.values(guessEntries), misMatchIds); toastr.error(`Guess Id ${misMatchIds.map((item)=> item)} are Mismatched. Please Verify as a New Guess`); 
       
        return [guessEntries, misMatchIds, "Mismatch found"]; }
        else { await populateTable(Object.values(guessEntries), misMatchIds);  return [guessEntries, 0, "No Mismatch found"]; }
    } catch (error) {
        toastr.error("Error fetching user data pool");
    }
}

// Function to convert the BgInt to a Number
const convertBigIntToNumber = (value) => {
    return typeof value === 'bigint' ? Number(value) : value;
};

// Function to update (update_guess_verify,place_new_guess , login) to the firebase
async function updateFireBaseData(_SNo, entryFor, data) {
    try {
      const _rowName = 'row' + _SNo;
      const dbRef = ref(database, `${currentAccount}/` + _rowName);
      let updateData = {};
  
      switch (entryFor) {
        case 'update_guess_verify':
            updateData = { targetVerified: 2 };
            await update(dbRef, updateData);
            toastr.info(`Guess ID ==> ${_rowName} updated as verified!`);
            break;
        case 'place_new_guess':
            updateData = {
              guessId: Number(data.guessId),
              paidGuess: Boolean(data.paidGuess),
            //   targetBlockNumber: Number(data.targetBlockNumber),
            //   targetVerified: Number(data.targetVerified),
              tokenSize: Number(data.tokenSize),
              complex: Boolean(data.complex),
              dummyHash: data.dummyHash,
              actualHash: data.actualHash,
              secretKey: data.secretKey
            };
            await update(dbRef, updateData);
            toastr.info(`Entire data of Guess ID ==> ${_rowName} was updated!`);
            break;
        case 'login':
            updateData = {
              guessId: _SNo,
              paidGuess: data.paidGuess,
              targetBlockNumber: Number(data.targetBlockNumber),
              targetVerified: Number(data.targetVerified),
              tokenSize: Number(data.tokenSize),
              complex: data.complex,
              dummyHash: data.userHashGuess,
            };
            await update(dbRef, updateData);
            break;
         case 'field_insertion':
            updateData = {
                actualHash: data.actualHash,
                secretKey: data.secretKey
            };
            const missingSetValues = await update(dbRef, updateData);
            toastr.success('Updated missing fields to firebase');
            break;
        default:
            toastr.error('Unknown Process Entered');
      }
      return true;
    } catch (error) {
        toastr.error("Failed to update Firebase Realtime Database");
    }
}

// Function for compare the dummy hash from infura with firebase dummy hash
async function compareDummyActualHashes(_rowNo){
    try {
      const _rowName = 'row' + _rowNo;
      const dummyHashRef = ref(database, `${currentAccount}/` + _rowName + "/dummyHash");
      const dummyHash = await get(dummyHashRef);
      const actualHashRef = ref(database, `${currentAccount}/` + _rowName + "/actualHash");
      const actualHash = await get(actualHashRef);
      const secretKeyRef = ref(database, `${currentAccount}/` + _rowName + "/secretKey");
      const secretKey = await get(secretKeyRef);
      if (dummyHash.exists() && actualHash.exists() && secretKey.exists()) {
        if(dummyHash.val() == "0x0000000000000000000000000000000000000000000000000000000000000000"){

            return [true, [actualHash.val(), secretKey.val()]];
        }
        const generatedDummyHash = await getUnrevealedHash(actualHash.val(), secretKey.val());
        if (dummyHash.val() === generatedDummyHash) { return [true, [actualHash.val(), secretKey.val()]];}
        else { return [false, [actualHash.val(), secretKey.val()]]; }
      } else{
        toastr.error("Unable to fetch dummy and actual hashes with secret key");
        return false;
      }
  
    } catch(error) {
      toastr.error("Error fetching hashes");
      return false;
    }
  
}

// fuction for generating the unrevealed hash (return : hash)
async function getUnrevealedHash(_actualHash, _secretKey) {
    const encodedCombination = npInfura.eth.abi.encodeParameters(['bytes32', 'bytes32'], [_actualHash, _secretKey]);
    const unrevealedHash = npInfura.utils.keccak256(encodedCombination);
    return unrevealedHash;
}

// Toastr configuration
toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "showDuration": "300",
    "hideDuration": "5000",
    "timeOut": "5000",
    "extendedTimeOut": "5000",
};

// Functions to trigger toasts
function showSuccess(data) {
    toastr.success(data);
}

function showError(data) {
    toastr.error(data);
}

function showInfo() {
    toastr.info('Here is some information.', 'Info');
}

function showWarning() {
    toastr.warning('Be cautious with this action.', 'Warning');
}

// onload page events
document.addEventListener('DOMContentLoaded', async () => {

    console.log("Checking stored wallet...");

    window.dispatchEvent(new Event('eip6963:requestProvider')); // Ensure wallets announce themselves again

    try {
        browserWallet = await waitForWallet();
        console.log("Restored browserWallet:", browserWallet);
        // Register wallet events only after the wallet is initialized
        await registerWalletEvents();
    } catch (error) {
        console.error(error.message);
    }

    // Check if the wallet was successfully reconnected
    if (localStorage.getItem("walletReconnected") === "true") {
        console.log("Wallet reconnected successfully.");
        localStorage.removeItem("walletReconnected"); // Clear flag
    }

    // Check user login status
    if (!IsLoggedIn()) {
        toastr.error("User is not logged in.");
        return;
    }
    // Shared functionality
    setupSharedListeners();

    // Define page-specific titles and their corresponding functions
    const pageHandlers = {
        "Session": async () => {
            document.getElementById('login').addEventListener('click', logIN);
            document.getElementById('registerButton').addEventListener('click', registerWallet);
        },
        "Home": async () => {
           
            document.getElementById('getBalance').addEventListener('click', getTokenBalance);
            document.getElementById('syncPoolDatabtn').addEventListener('click', syncDataWithTokenCrt);
            document.getElementById('wallet-address-username').innerHTML = currentAccount;
            await loginForRegUsers();
        },
        "New Guess": async () => {
            await patchFormValuesFromGuess();
            setupHashEventListeners();
        },
        "Verify Off Chain": async () => {
            await getSeedData();
        },
        "Verify On Chain": async () => {
            await matchedData();
        }
    };

    // Get the current page title
    const currentTitle = document.title;

    // Check if a handler exists for the current title
    if (pageHandlers[currentTitle]) {
        await pageHandlers[currentTitle]();
    } else {
       
    }

});

function waitForWallet(timeout = 3000) {
    return new Promise((resolve, reject) => {
        let elapsedTime = 0;
        const checkInterval = 100;  
        
        const interval = setInterval(() => {
            if (window.selectedWallet) {
                clearInterval(interval);
                resolve(window.selectedWallet);
            }
            elapsedTime += checkInterval;
            if (elapsedTime >= timeout) {
                clearInterval(interval);
                reject(new Error("Timeout waiting for wallet provider"));
            }
        }, checkInterval);
    });
}