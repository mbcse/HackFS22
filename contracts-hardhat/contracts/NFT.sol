// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract EVENT_ON_CHAIN_NFT is
    Initializable,
    AccessControlEnumerableUpgradeable,
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable,
    ERC721BurnableUpgradeable,
    ERC721PausableUpgradeable
{
    
    using StringsUpgradeable for uint256;
    
    function initialize(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address rootAdmin
    ) public virtual initializer {
        __NFT_init(name, symbol, baseTokenURI, rootAdmin);
    }

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    string private _baseTokenURI;

    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE` and `PAUSER_ROLE` to the
     * account that deploys the contract.
     *
     * Token URIs will be autogenerated based on `baseURI` and their token IDs.
     * See {ERC721-tokenURI}.
     */
    function __NFT_init(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address rootAdmin
    ) internal initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __AccessControl_init_unchained();
        __AccessControlEnumerable_init_unchained();
        __ERC721_init_unchained(name, symbol);
        __ERC721Enumerable_init_unchained();
        __Ownable_init_unchained();
        __ERC721Burnable_init_unchained();
        __Pausable_init_unchained();
        __ERC721Pausable_init_unchained();
        __NFT_init_unchained(name, symbol, baseTokenURI, rootAdmin);
    }

    function __NFT_init_unchained(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address rootAdmin
    ) internal initializer {
        _baseTokenURI = baseTokenURI;
        
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, rootAdmin);
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, ADMIN_ROLE);
    }
    
    mapping(uint256 => string) private _tokenURIs;

    struct EventPass{
        string recieverName;
        address reciever;
        uint price;
        uint burnValue;
    }

    mapping(uint=>EventPass) public eventPasses;
    

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];

        // If there is no base URI, return the token URI.
        if (bytes(_baseTokenURI).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_baseTokenURI).length > 0) {
            
            if(bytes(_tokenURI).length == 0) {
                // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
                return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
            }
            
            return string(abi.encodePacked(_baseTokenURI, _tokenURI));
        }
    }
    
    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        
        bytes memory tempBytes = bytes(_tokenURI);
        if(tempBytes.length > 0) _tokenURIs[tokenId] = _tokenURI;
    }

     /**
    * @dev overriding the inherited {transferOwnership} function to reflect the admin changes into the {DEFAULT_ADMIN_ROLE}
    */
    function transferOwnership(address newOwner) public override onlyOwner {
        super.transferOwnership(newOwner);
        _setupRole(DEFAULT_ADMIN_ROLE, newOwner);
        renounceRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }
    
    /**
    * @dev overriding the inherited {grantRole} function to have a single root admin
    */
    function grantRole(bytes32 role, address account) public override {
        if(role == ADMIN_ROLE)
            require(getRoleMemberCount(ADMIN_ROLE) == 0, "exactly one address can have admin role");
            
        super.grantRole(role, account);
    }

    /**
    * @dev modifier to check admin rights.
    * contract owner and root admin have admin rights
    */
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()) || owner() == _msgSender(), "Restricted to admin.");
        _;
    }
    
    /**
    * @dev modifier to check mint rights.
    * contract owner, root admin and minter's have mint rights
    */
    modifier onlyMinter() {
        require(
            hasRole(ADMIN_ROLE, _msgSender()) || 
            hasRole(MINTER_ROLE, _msgSender()) || 
            owner() == _msgSender(), "Restricted to minter."
            );
        _;
    }

       /**
    * @dev modifier to check pause rights.
    * contract owner, root admin and pausers's have pause rights
    */
    modifier onlyPauser() {
        require(
            hasRole(ADMIN_ROLE, _msgSender()) || 
            hasRole(PAUSER_ROLE, _msgSender()) || 
            owner() == _msgSender(), "Restricted to pauser."
            );
        _;
    }
    
    /**
    * @dev This function is to change the root admin 
    * exaclty one root admin is allowed per contract
    * only contract owner have the authority to add, remove or change
    */
    function changeRootAdmin(address newAdmin) public {
        address oldAdmin = getRoleMember(ADMIN_ROLE, 0);
        revokeRole(ADMIN_ROLE, oldAdmin);
        grantRole(ADMIN_ROLE, newAdmin);
    }
    
    /**
    * @dev This function is to add a minter or pauser into the contract, 
    * only root admin and contract owner have the authority to add them
    * but only the root admin can revoke them using {revokeRole}
    * minter or pauser can also self renounce the access using {renounceRole}
    */
    function addMinterOrPauser(address account, bytes32 role) public onlyAdmin{
        if(role == MINTER_ROLE || role == PAUSER_ROLE)
            _setupRole(role, account);
    }


    function _setEventPassDetails(uint _passId, string memory _receiverName, address _receiver, uint _price, uint _burnValue) internal {
        eventPasses[_passId] = EventPass(_receiverName,_receiver,_price, _burnValue);
    }
    
  
    // As part of the lazy minting this mint function will be called by the admin and will transfer the NFT to the buyer
    function mint(address receiver,uint collectibleId, string memory IPFSHash) public onlyMinter {
        _mint(receiver, collectibleId);
        _setTokenURI(collectibleId, IPFSHash);
    }

    // As part of the lazy minting this mint function will be called by the admin and will transfer the NFT to the buyer
    function mintTicket(string memory receiverName, address receiver,uint passId, string memory IPFSHash, uint ticketPrice, uint ticketBurnValue) public {
        _setEventPassDetails(passId, receiverName, receiver, ticketPrice, ticketBurnValue);
        _mint(receiver, passId);
        _setTokenURI(passId, IPFSHash);
    }
    
    /**
    * @dev This funtion is to give authority to root admin to transfer token to the
    * buyer on behalf of the token owner
    *
    * The token owner can approve and renounce the access via this function
    */
    function setApprovalForOwner(bool approval) public {
        address defaultAdmin = getRoleMember(ADMIN_ROLE, 0);
        setApprovalForAll(defaultAdmin, approval);
    }
    
    /**
    * @dev This funtion is to give authority to minter to transfer token to the
    * buyer on behalf of the token owner
    *
    * The token owner can approve and renounce the access via this function
    */
    function setApprovalForMinter(bool approval, address minterAccount) public {
        require(hasRole(MINTER_ROLE, minterAccount), "not a minter address");
        setApprovalForAll(minterAccount, approval);
    }

    /**
    * @dev This funtion is to check weather the contract admin have approval from a token owner
    *
    */
    function isApprovedForOwner(address account) public view returns (bool approval){
        address defaultAdmin = getRoleMember(ADMIN_ROLE, 0);
        return isApprovedForAll(account, defaultAdmin);
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public virtual onlyPauser{
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public virtual onlyPauser{
        _unpause();
    }


    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        // add support to EIP-2981: NFT Royalty Standard
        if(interfaceId == _INTERFACE_ID_ERC2981){
            return true;
        }
        return super.supportsInterface(interfaceId);
    }


    function nftExists(uint256 collectableId) public view returns(bool){
        return _exists(collectableId);
    }




    uint256[48] private __gap;
}