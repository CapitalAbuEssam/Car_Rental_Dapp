# Before you start
Download node.js and make sure to download the npm packages necessary to work download truffle

You'll also download ganache which is a UI representation of what you actully do on your local blockchain.

Lastly, you'll download the Metamask extension from your browser.

# Frontend

# Add Cars page
<img width="1440" alt="frontend_interface" src="https://github.com/CapitalAbuEssam/Car_Rental_Dapp/assets/170141175/68b734ab-65b2-4a2f-8902-25880fbbb902">

# Owner of the contract view
<img width="1425" alt="Screenshot 2024-05-21 at 11 17 55 PM" src="https://github.com/CapitalAbuEssam/Car_Rental_Dapp/assets/170141175/3c6e2b3d-b10f-4af5-9fd0-30a16abb8a47">

# View of another metamask account that rented a car
<img width="1423" alt="Screenshot 2024-05-21 at 11 29 12 PM" src="https://github.com/CapitalAbuEssam/Car_Rental_Dapp/assets/170141175/9104e986-aa8d-4fd1-8804-27977ca5b750">

# View of the Owner after a renter has rented a car
<img width="1422" alt="Screenshot 2024-05-21 at 11 20 36 PM" src="https://github.com/CapitalAbuEssam/Car_Rental_Dapp/assets/170141175/a6376463-0aaa-4748-b347-0ee6395a2176">


# Setting up the Car Rental Dapp

"Assuming you've installed all your dependencies"

1. write the following in the terminal (VS):

```truffle compile```

2. copy the **build folder** and paste the exact same folder inside the **src folder**

3. then write in the terminal:

```truffle migrate --reset```

```truffle test```

4. After passing the test:

```npm install``` to handle updating the project dependencies
```cd car-rental-frontend```
```npm start```

# Enjoy your local Dapp Car Rental!

