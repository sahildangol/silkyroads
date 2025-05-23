// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    address public owner;
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }
    struct Order {
        uint256 time;
        Item item;
    }
    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;
    event Buy(address buyer, uint256 orderId, uint256 itemId);
    event List(string name, uint256 cost, uint256 quantity);
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    constructor() {
        owner = msg.sender;
    }

    //List Products
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost, //Unsigned as these can't have negative value
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        //Create Item
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );
        //Save the Item to Blockchain
        items[_id] = item;
        //EMIT AN EVENT
        emit List(_name, _cost, _stock);
    }
    //Buy Products

    function buy(uint256 _id) public payable {
        //fetch item
        Item memory item = items[_id];
        require(msg.value >= item.cost);
        require(item.stock > 0);
        Order memory order = Order(block.timestamp, item);
        //Save Order to Chain
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        //Subtract stock
        items[_id].stock = item.stock - 1;
        //Emit event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }
    //Withdraw Funds
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
