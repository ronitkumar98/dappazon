// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    address public owner;
    
    struct item{
        uint256 id;
        string  name;
        string  category;
        string  image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct order{
        uint256 time;
        item Item;
    }

    mapping(uint256=>item)public items;
    mapping(address=>uint256)public orderCount;
    mapping(address=>mapping(uint256=>order))public orders;

    event Buy(address buyer,uint256 orderId,uint256 ItemId);
    event List(uint256 id,string name,uint256 quantity);

    modifier onlyowner{
        require(msg.sender==owner);
        _;
    }
    constructor(){
        owner=msg.sender;
    }
    //list products
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    )public onlyowner{
        
        item memory Item=item(_id,_name,_category,_image,_cost,_rating,_stock);
        items[_id]=Item;
        emit List(_cost,_name,_stock);
    }
    //buy products
    function buy(uint256 _id)public payable{
        //recieve crypto done using payable function

        //recieve the item
        item memory Item=items[_id];
        
        require(msg.value>=Item.cost);
        require(Item.stock>0);

        //create an order
        order memory Order=order(block.timestamp,Item);

        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]]=Order;

        //subtract stock
        items[_id].stock=Item.stock-1;

        //emit event
        emit Buy(msg.sender,orderCount[msg.sender],Item.id);
    }
    //withdraw funds
    function withdraw()public onlyowner{
        (bool sucess,)=owner.call{value:address(this).balance}("");
        require(sucess);
    }
}
