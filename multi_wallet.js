/* EIP-6963 Wallet Detection and Selection Module */

import {logos} from './logolist.js';

const addedWallets = new Set();
let walletContainer, connectButton, statusMessage;
let selectedWallet = null;
let selectedWalletRdns = null;
let metamaskConnection = false;
let isDOMLoaded = false;
const providerQueue = [];
const walletLogos = logos;

// Handle newly discovered providers
function handleNewProvider(providerDetail) {
    if (!walletContainer) {
        console.error('walletContainer is not defined');
        alert("No Wallets detected in the browser!");
        return;
    }

    if (addedWallets.has(providerDetail.info.uuid)) return;
    addedWallets.add(providerDetail.info.uuid);

    const walletOption = document.createElement('div');
    walletOption.classList.add('wallet-option');

    const logo = document.createElement('img');
    logo.src = walletLogos[providerDetail.info.name] || './notfound.svg'; // Fallback logo
    // logo.alt = `${providerDetail.info.name}`;
    logo.alt = '???';
    logo.classList.add('wallet-logo');

    const label = document.createElement('label');
    label.textContent = providerDetail.info.name;
    label.classList.add('wallet-label');

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'walletSelection';
    radio.value = providerDetail.info.uuid;
    radio.onclick = () => selectWallet(providerDetail.info.rdns, providerDetail.provider, providerDetail.info.name);

    walletOption.appendChild(logo);
    walletOption.appendChild(label);
    walletOption.appendChild(radio);

    walletContainer.appendChild(walletOption);
}

// Select wallet and enable connect button
function selectWallet(providerrdns, provider, walletName) {
    selectedWallet = provider;
    selectedWalletRdns = providerrdns;
    console.log("Our Data",providerrdns, provider, walletName);
    const isMetaMask = walletName.toLowerCase().includes('metamask');
    console.log(`Selected wallet: ${walletName}, MetaMask: ${isMetaMask}`);
    if (isMetaMask) {metamaskConnection = true; }
    else{ metamaskConnection = false; }

    statusMessage.textContent = `Selected: ${walletName}`;
    connectButton.disabled = false;

}

// Connect to the selected wallet
async function connectToWallet() {
    if (!selectedWallet) { statusMessage.textContent = 'No wallet selected.'; return; }

    try {
        if(metamaskConnection){
            localStorage.setItem("selectedWalletRdns", selectedWalletRdns);
            const accounts = await selectedWallet.request({ method: 'eth_requestAccounts' });
            console.log('Connected account:', accounts[0]);
            statusMessage.textContent = `Connected: ${accounts[0]}`;
            setupWalletListeners(selectedWallet);
            setTimeout(() => {
                window.location.href = '/session.html';
            }, 500);   
        }
        else { alert("No Metamask"); localStorage.removeItem("selectedWalletRdns"); }
        console.log("Final Output", metamaskConnection, localStorage.getItem("selectedWalletRdns"));
    } catch (error) {
        console.error('Connection failed:', error);
        statusMessage.textContent = 'Connection failed. Check console for details.';
    }
}

// Handle provider events
function setupWalletListeners(provider) {
    provider.on('accountsChanged', (newAccounts) => {
        console.log('Account changed:', newAccounts[0]);
        statusMessage.textContent = `Account changed: ${newAccounts[0]}`;
    });
    provider.on('chainChanged', (chainId) => {
        console.log('Chain changed:', chainId);
        statusMessage.textContent = `Chain changed: ${chainId}`;
    });
    provider.on('disconnect', (error) => {
        console.log('Wallet disconnected:', error);
        statusMessage.textContent = 'Wallet disconnected.';
        resetSelection();
    });
}

// Reset selection on disconnect
function resetSelection() {
    selectedWallet = null;
    statusMessage.textContent = 'Wallet selection reset.';
    connectButton.disabled = true;
}

// Process queued providers
function processProviderQueue() {
    while (providerQueue.length > 0) {
        console.log("This is from Dom Loaded Space");
        handleNewProvider(providerQueue.shift());
    }
}

// Listen for EIP-6963 provider announcements
window.addEventListener('eip6963:announceProvider', (event) => {
    if (isDOMLoaded) {
        handleNewProvider(event.detail);
        console.log("This is from Window Object");
    } else {
        providerQueue.push(event.detail);
    }
});

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', function () {
    walletContainer = document.getElementById('walletContainer');
    connectButton = document.getElementById('connectButton');
    statusMessage = document.getElementById('statusMessage');
    let gotobtn = document.getElementById("gotobutton");
    isDOMLoaded = true;

    processProviderQueue();
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // Older version wallets detection
    // if (window.ethereum && !window.ethereum.providers) {
    //     handleNewProvider({
    //         info: { name: 'MetaMask (Legacy)', uuid: 'legacy-metamask' },
    //         provider: window.ethereum,
    //     });
    // }

    connectButton.addEventListener('click', connectToWallet);
});