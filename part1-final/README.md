# BAR Token Transfer Tracker
### By Cristian Torrijos Lázaro (c@cristian.pro)

## Project Overview
This project is designed to track and list all transfer events of the BAR token (an ERC20 token) where either the sender or the receiver is part of a specified list. The focus is on transfers that have occurred within the last two years.

## Getting Started

### Prerequisites
- Ensure that Node.js is installed on your system.

### Installation
1. Navigate to the project's directory in your terminal.
2. Run the following command to install necessary dependencies:
    ```
    yarn
    ```
   Alternatively, if you are using npm, run:
    ```
    npm install
    ```

### Running the Project
Execute the script to track the token transfers with the following command:

   ```
   node from2yearsAgoWithFiltersAndPromises.js
   ```

This will start the process of fetching and displaying the relevant BAR token transfer events based on the specified criteria.