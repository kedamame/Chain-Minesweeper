// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChainMinesweeper {
    mapping(address => uint256) public totalClears;
    // player => UTC day (timestamp / 86400) => recorded
    mapping(address => mapping(uint256 => bool)) private _dailyCleared;

    event ClearRecorded(address indexed player, bool isDaily, uint256 total);

    function recordClear(bool isDaily) external {
        if (isDaily) {
            uint256 today = block.timestamp / 86400;
            require(!_dailyCleared[msg.sender][today], "Already recorded today");
            _dailyCleared[msg.sender][today] = true;
        }
        totalClears[msg.sender]++;
        emit ClearRecorded(msg.sender, isDaily, totalClears[msg.sender]);
    }

    function hasClearedToday(address player) external view returns (bool) {
        return _dailyCleared[player][block.timestamp / 86400];
    }
}
