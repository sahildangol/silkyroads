const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
//GLOBAL VARIABLES
const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Silky Roads", () => {
  let dappazon;
  let deployer, buyer;
  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    //Deploy Contract Each Time At Testing
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });
  describe("Deployment", () => {
    it("Sets the Owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });
  describe("Listing", () => {
    let transaction;
    beforeEach(async () => {
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
    });
    it("Returns Item Attribute", async () => {
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });
    it("Emits list event", () => {
      expect(transaction).to.emit(dappazon, "List");
    });
  });
  describe("Buying", () => {
    let transaction;
    beforeEach(async () => {
      //LIST AN ITEM
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
      //BUY AN ITEM
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
    });
    it("Updates the Contract Balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address); //Check Balance
      expect(result).to.equal(COST);
    });
    it("Updates Buyer Count", async () => {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });
    it("Adds Order", async () => {
      const order = await dappazon.orders(buyer.address, 1);
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });
    it("Emits Buy Event", () => {
      expect(transaction).to.emit(dappazon, "Buy");
    });
    describe("Withdrawing", () => {
      let balanceBefore;
      beforeEach(async () => {
        let transaction = await dappazon
          .connect(deployer)
          .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
        await transaction.wait();
        //BUY AN ITEM
        transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
        await transaction.wait();
        //GET DEPLOYER BALANCE BEFORE
        balanceBefore = await ethers.provider.getBalance(deployer.address);
        //withdraw
        transaction = await dappazon.connect(deployer).withdraw();
        await transaction.wait();
      });
      it("Updates the Owner Balance", async () => {
        const balanceAfter = await ethers.provider.getBalance(deployer.address);
        expect(balanceAfter).to.be.greaterThan(balanceBefore);
      });
      it("updates teh contract balance", async () => {
        const result = await ethers.provider.getBalance(dappazon.address);
        expect(result).to.equal(0);
      });
    });
  });
});
