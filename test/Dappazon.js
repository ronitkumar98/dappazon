const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}


const ID=1
const NAME="SHOES"    
const CATEGORY="CLOTHING"
const IMAGE="https://ipfs.io/ipfs/QmTYEboq8raiBs77GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST=tokens(1)
const RATING=4
const STOCK=5


describe("Dappazon", () => {
  let dappazon
  let deployer,buyer

  beforeEach(async()=>{
    [deployer,buyer]=await ethers.getSigners();

    const Dappazon= await ethers.getContractFactory("Dappazon")
    dappazon=await Dappazon.deploy()
  })

  describe("Deployment",()=>{
    it('has an owner',async()=>{
      expect(await dappazon.owner()).to.equal(deployer.address)
    })
    
  })

  describe("Listing",()=>{
    let transaction;

    const ID=1
    const NAME="SHOES"
    const CATEGORY="CLOTHING"
    const IMAGE="https://ipfs.io/ipfs/QmTYEboq8raiBs77GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
    const COST=tokens(4)
    const RATING=4
    const STOCK=5

    beforeEach(async()=>{
      transaction=await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait()
    })
    it('returns item attributes',async()=>{
      const item=await dappazon.items(ID)
      expect(item.id).to.equal(ID)
      expect(item.name).to.equal(NAME)
      expect(item.category).to.equal(CATEGORY)
      expect(item.image).to.equal(IMAGE)
      expect(item.cost).to.equal(COST)
      expect(item.rating).to.equal(RATING)
      expect(item.stock).to.equal(STOCK)
    })
    it("emits list",async()=>{
      expect(transaction).to.emit(dappazon,"List")
    })
    
  })
  describe("Buying",()=>{
    let transaction;

    const ID=1
    const NAME="SHOES"
    const CATEGORY="CLOTHING"
    const IMAGE="https://ipfs.io/ipfs/QmTYEboq8raiBs77GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
    const COST=tokens(4)
    const RATING=4
    const STOCK=5

    beforeEach(async()=>{
      //list a transaction
      transaction=await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait()
      //buy an item
      transaction=await dappazon.connect(buyer).buy(ID,{value:COST})
    })
    it("updates the buyer order count",async()=>{
      const result=await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1)
    })
    it("adds the order",async()=>{
      const order=await dappazon.orders(buyer.address,1)

      expect(order.time).to.be.greaterThan(0)
      expect(order.Item.name).to.equal(NAME)
    })
    it("Updates the contact balance",async()=>{
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(COST)
    })
    it("emits buy event",async()=>{
      expect(transaction).to.emit(dappazon,"Buy")
    })
  })
  describe("withdrawing",()=>{
    let balanceBefore
    beforeEach(async()=>{
      //list a transaction
      let transaction=await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait()
      //buy an item
      transaction=await dappazon.connect(buyer).buy(ID,{value:COST})
      await transaction.wait()

      balanceBefore=await ethers.provider.getBalance(deployer.address)

      transaction=await dappazon.connect(deployer).withdraw();
      await transaction.wait();

    })
    it("Updates owner balance",async()=>{
      const banlanceAfter=await ethers.provider.getBalance(deployer.address)
      expect(banlanceAfter).to.be.greaterThan(balanceBefore)
    })
    it("updates contract balance",async()=>{
      const result=await ethers.provider.getBalance(deployer.address)
      expect(result).to.equal(0)
    })
  })
})
