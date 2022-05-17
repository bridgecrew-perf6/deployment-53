import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { parse } from 'path';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';

import dgnr8ABI from '../../environments/Config/abis/dgnr8.json';
import simpleERC721ABI from '../../environments/Config/abis/simpleERC721.json';
import simpleERC1155ABI from '../../environments/Config/abis/simpleERC1155.json';
import marketPlaceABI from '../../environments/Config/abis/marketplace.json';
import erc20 from "../../environments/Config/abis/erc20.json"
import BigNumber from "bignumber.js";

import { ethers } from 'ethers';

import contracts from '../../environments/Config/contracts';
import { sign } from 'crypto';

declare let window: any;
declare let $: any;

@Component({
  selector: 'app-nft-detail',
  templateUrl: './nft-detail.component.html',
  styleUrls: ['./nft-detail.component.css'],
})
export class NFTDetailComponent implements OnInit, OnDestroy {
  // console.log('---aNFT------',aNFT.sCollectionDetail)

  NFTData: any = {};
  NFTOwnerData:any={};
  historyData: any = [];
  tokenHistoryData: any = [];
  interVal: any;
  collaboratorList: any = [];

  bidForm: any;
  submitted1: Boolean = false;

  transferForm: any;
  submitted2: Boolean = false;

  buyForm: any;
  saleForm:any;
  submitted3: Boolean = false;

  changePriceForm: any;
  submitted4: Boolean = false;

  timedAuctionForm: any;
  submitted5: Boolean = false;

  isLogin: any = false;
  sellingType: any = '';
  id: any;
  account: any;
  marketPlace: any;
  sellerSign: any = [];
  buyerOrder: any = [];
  tokenType:Boolean=false;

  NFTBase_Price:any = 0;
  

  NFTprice: any;


  ShowBuyBtnERC1155: Boolean = false;
  NFTAllOwnerData:any={};
  CurrentUserID:any="";
  currentOwnerPrice:any="";
  currentOwnerQty:any="";
  buyFormOwner: any;
  currentOwnersaccount: any="";
  currentOwnersOrder:any="";

  //seller Order

  sellerOrder: any = [];

  auct_time: any = {
    mins: 0,
    secs: 0,
    hours: 0,
  };
  showObj: any = {
    wallet_address: localStorage.getItem('sWalletAddress'),
    showBidCurrent: 'show',
    showTransferCurrent: 'hide',
    showBuyCurrent: 'show',
  };
  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService
  ) {}

  ngOnDestroy() {
    clearInterval(this.interVal);
    var magnificPopup = $.magnificPopup.instance;
    // save instance in magnificPopup variable
    magnificPopup.close();
  }

  async ngOnInit() {
    let scripts: string[] = [];
    scripts = [
      '../../assets/js/jquery-3.5.1.min.js',
      '../../assets/js/bootstrap.bundle.min.js',
      '../../assets/js/owl.carousel.min.js',
      '../../assets/js/jquery.magnific-popup.min.js',
      '../../assets/js/select2.min.js',
      '../../assets/js/smooth-scrollbar.js',
      '../../assets/js/jquery.countdown.min.js',
      '../../assets/js/main.js',
    ];

    this._script.loadScripts('app-nft-detail', scripts).then(function () {});
    this.buildBidForm();
    this.buildTransferForm();
    this.buildBUYForm();
    this.buildSALEForm();
    this.buildCHANGEPRICEForm();
    this.buildTIMEDAUCTIONForm();
    this.account = await this.apiService.connect();

    let contract = await this.apiService.exportInstance(
      contracts.MARKETPLACE,
      marketPlaceABI.abi
    );
    this.marketPlace = contract;
    console.log('market place contract is---->', this.marketPlace);

    let id = this._route.snapshot.params['id'];
    if (id && id != null && id != undefined && id != '') {
      await this.getNFTViewData(id);
      await this.getNFTOwnerData(id);
      await this.getNFTOwnerAllData(id);

      
      

      await this.getBidHistory(id);
     
      
      if (
        localStorage.getItem('Authorization') &&
        localStorage.getItem('Authorization') != null
      ) {
        this.isLogin = true;
        await this.getColoboraterList();
      }
    } else {
      this.toaster.info('There is some issue with route.');
      this.router.navigate(['']);
    }
  }
  buildCHANGEPRICEForm() {
    this.changePriceForm = this._formBuilder.group({
      nBasePrice: ['', [Validators.required]],
    });
  }
  buildTIMEDAUCTIONForm() {
    this.timedAuctionForm = this._formBuilder.group({
      type: ['Auction', [Validators.required]],
      days: ['', []],
    });
  }

  buildBidForm() {
    this.bidForm = this._formBuilder.group({
      nQuantity: ['', [Validators.required]],
      nBidPrice: ['', [Validators.required]],
    });
  }

  buildTransferForm() {
    this.transferForm = this._formBuilder.group({
      nQuantity: ['', [Validators.required]],
      oRecipient: ['', [Validators.required]],
    });
  }
  buildBUYForm() {
    this.buyForm = this._formBuilder.group({
      nQuantity: ['1', [Validators.required]],
      nBidPrice: [{ value: '0.01', disabled: true }, [Validators.required]],
    });
  }

  buildBUYFormOwner(price, quantity) {
    this.buyFormOwner = this._formBuilder.group({
      nQuantity: [quantity, [Validators.required]],
      nBidPrice: [{ value: price, disabled: true }, [Validators.required]],
    });
  }

  buildSALEForm() {
    this.saleForm = this._formBuilder.group({
      nQuantity: ['1', [Validators.required]],
      orderPrice: [this.NFTBase_Price, [Validators.required]],
    });
  }

  toTypedOrder(
    account, tokenAddress, id, quantity, listingType, paymentTokenAddress, valueToPay, deadline, bundleTokens, bundleTokensQuantity, salt
) {
    const domain = {
        chainId: 80001,
        name: 'Decrypt Marketplace',
        verifyingContract:contracts.MARKETPLACE,
        version: '1',
    };

    const types = {
        Order: [
            { name: 'user', type: 'address' },
            { name: 'tokenAddress', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'quantity', type: 'uint256' },
            { name: 'listingType', type: 'uint256' },
            { name: 'paymentToken', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'bundleTokens', type: 'bytes32' },
            { name: 'salt', type: 'uint256' },
        ],
    };

  
    let bundleTokensHash;
    if(bundleTokens.length === 0){
        bundleTokensHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    else{
        const typesArray = new Array(bundleTokens.length).fill('uint256');
        const indexHash = ethers.utils.solidityKeccak256(typesArray,bundleTokens);
        const arrayHash = ethers.utils.solidityKeccak256(typesArray,bundleTokensQuantity);
        bundleTokensHash = ethers.utils.solidityKeccak256(['bytes32','bytes32'],[indexHash,arrayHash]);
    }

  
  
    const value = {
        user: account,
        tokenAddress:tokenAddress,
        tokenId:id,
        quantity: quantity,
        listingType: listingType,
        paymentToken:paymentTokenAddress,
        value:valueToPay,
        deadline: deadline,
        bundleTokens: bundleTokensHash,
        salt: salt,
    };

    return { domain, types, value };
}

//GETTING SIGNATURE FUNCTION

async getSignature(signer,...args){
  console.log("calling getting signature function")
  const order = this.toTypedOrder(...args);
  let provider = new ethers.providers.Web3Provider(window.ethereum)

 

    const signer1 =  provider.getSigner()
    

  const signedTypedHash =  await signer1._signTypedData(
      order.domain,
      order.types,
      order.value
  );

  const sig = ethers.utils.splitSignature(signedTypedHash);
  

  return [sig.v, sig.r, sig.s];
}

  getColoboraterList() {
    this.apiService.getColoboraterList().subscribe(
      (res: any) => {
        if (res && res['data']) {
          this.collaboratorList = res['data'];
        }
      },
      (err: any) => {}
    );
  }

  getNFTViewData(id: any) {
    console.log("nft api is called----->",id)
    this.apiService.viewnft(id).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];

          

          this.NFTData = res;

          this.CurrentUserID = res.loggedinUserId;
          console.log("nft view data is ---->",this.NFTData)
          if(res.erc721){
            this.tokenType=true;
            console.log("tokenType is--->",this.tokenType)
          }else{
            this.tokenType=false;
            this.ShowBuyBtnERC1155 = true;
            console.log("tokenType is--->",this.tokenType)
          }
          console.log("NFT data is---->",this.NFTData)
          


          console.log("seller and buyer order is---->",this.sellerOrder,this.buyerOrder)
          console.log("checks for nftview---->",this.NFTOwnerData.oCurrentOwner.sWalletAddress)

          
          if (this.NFTData.nTokenID && this.NFTData.nTokenID != undefined) {
            // tokenHistoryData
            this.getTokenHistory(this.NFTData.nTokenID);
          }

          // token
          // tokenHistory  nTokenID
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }


  getNFTOwnerData(id: any) {
    console.log("nft owner api is called----->",id)
    
    this.apiService.viewnftOwner(id).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];

          

          this.NFTOwnerData = res;
          console.log("nftOwner view data is ---->",res)
          
         


          console.log("seller and buyer order is---->",this.sellerOrder,this.buyerOrder)
          console.log("conditions--->",this.NFTOwnerData.oCurrentOwner,this.NFTOwnerData.oCurrentOwner.sWalletAddress, this.showObj.wallet_address,this.NFTOwnerData.eAuctionType)
          
          if (
            (this.NFTOwnerData.oCurrentOwner &&
              this.NFTOwnerData.oCurrentOwner.sWalletAddress ==
                this.showObj.wallet_address) ||
            this.NFTOwnerData.eAuctionType == 'Fixed Sale'
          ) {
            this.showObj.showBidCurrent = 'hide';
          }
          if (
            this.NFTOwnerData.oCurrentOwner &&
            this.NFTOwnerData.oCurrentOwner.sWalletAddress ==
              this.showObj.wallet_address
          ) {
            this.showObj.showTransferCurrent = 'show';
          }
          console.log("conditions--->",this.NFTOwnerData.oCurrentOwner,this.NFTOwnerData.oCurrentOwner.sWalletAddress, this.showObj.wallet_address,this.NFTOwnerData.eAuctionType)
          
          if (
            this.NFTOwnerData.eAuctionType == 'Auction' ||
            this.NFTOwnerData.eAuctionType == '' ||
            (this.NFTOwnerData.oCurrentOwner &&
              this.NFTOwnerData.oCurrentOwner.sWalletAddress ==
                this.showObj.wallet_address)
          ) {
            this.showObj.showBuyCurrent = 'hide';
          }

          if (
            this.NFTOwnerData.auction_end_date != undefined &&
            this.NFTOwnerData.auction_end_date != null &&
            this.NFTOwnerData.auction_end_date &&
            this.NFTOwnerData.auction_end_date != ''
          ) {
            this.interVal = setInterval(async () => {
              let currentStarttime: any = new Date().getTime();
              let endDate: any = new Date(
                this.NFTOwnerData.auction_end_date
              ).getTime();

              let diff = parseInt(endDate) - parseInt(currentStarttime);
              if (diff && diff != undefined && diff != null && diff > 0) {
                await this.ConvertSectoDay(diff / 1000);
              }
            }, 2000);
          }

          if (this.NFTOwnerData.nBasePrice && this.NFTOwnerData.nBasePrice != undefined) {
            this.NFTBase_Price = this.NFTOwnerData.nBasePrice['$numberDecimal'];
            await this.buildSALEForm();
            this.buyForm.patchValue({
              nBidPrice: this.NFTOwnerData.nBasePrice['$numberDecimal'],
            });
          }

        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }


  getNFTOwnerAllData(id: any) {
    console.log("all nft owner api is called----->",id);
    this.apiService.getAllnftOwner(id).subscribe(
      async (data: any) => {
        if (data && data['data']) {
          let res = await data['data'];
          console.log("All NFT DATA ---->",res)
          this.NFTAllOwnerData = res;
        } else {
          
        }
      },
      (error) => {
      }
    );
  }


  getTokenHistory(id: any) {
    this.apiService.tokenHistory(id, {}).subscribe(
      async (data: any) => {
        console.log('---tokenHistoryData-----', data);
        if (data && data['data']) {
          let res = await data['data'];
          this.tokenHistoryData = res['data'];
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }

  getBidHistory(id: any) {
    this.apiService.bidHistory(id, {}).subscribe(
      async (data: any) => {
        console.log('---history-----', data);
        if (data && data['data']) {
          let res = await data['data'];
          this.historyData = res['data'];
        } else {
        }
      },
      (error) => {
        if (error) {
        }
      }
    );
  }

  // {{NFTData.nBasePrice && NFTData.nBasePrice != undefined ?
  //   NFTData.nBasePrice['$numberDecimal'] :'-' }}
  checkBuyQNT(e: any) {
    if (e.target.value) {
      if (parseInt(e.target.value) <= parseInt(this.NFTData.nQuantity)) {
        this.bidForm.patchValue({ nQuantity: parseInt(e.target.value) });
      } else {
        this.bidForm.patchValue({ nQuantity: '' });
        this.toaster.info('Amount exceeding NFT quantity.');
      }
    } else {
      this.bidForm.patchValue({ nQuantity: '' });
    }
  }
  checkBuyQNTT(e: any) {
    if (e.target.value) {
      if (parseInt(e.target.value) <= parseInt(this.NFTData.nQuantity)) {
        this.transferForm.patchValue({ nQuantity: parseInt(e.target.value) });
      } else {
        this.transferForm.patchValue({ nQuantity: '' });
        this.toaster.info('Amount exceeding NFT quantity.');
      }
    } else {
      this.transferForm.patchValue({ nQuantity: '' });
    }
  }

  checkBuyBQNT(e: any) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= parseInt(this.NFTData.nQuantity)) {
      } else {
        this.buyForm.patchValue({ nQuantity: '' });
        this.toaster.info('Amount exceeding NFT quantity.');
      }
    } else {
      this.buyForm.patchValue({ nQuantity: '' });
    }
  }

  checkBuyBQNTOwner(e: any, price) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= parseInt(price)) {
      } else {
        this.buyForm.patchValue({ nQuantity: '' });
        this.toaster.info('Amount exceeding NFT quantity.');
      }
    } else {
      this.buyForm.patchValue({ nQuantity: '' });
    }
  }
  // nQuantity: ['', [Validators.required]],
  // nBidPrice: ['', [Validators.required]],
  async onClickSubmitBID() {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      this.spinner.show();
      this.submitted1 = true;
      if (this.bidForm.invalid) {
        this.spinner.hide();
        return;
      } else {
        let res = this.bidForm.value;
        if (
          parseFloat(res.nBidPrice) >=
          parseFloat(this.NFTData.nBasePrice['$numberDecimal'])
        ) {
          let nTokenID =
            (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
              ? this.NFTData.nTokenID
              : 1;
          let price: any =
            parseFloat(res.nBidPrice) * parseFloat(res.nQuantity);
          let obj = {
            oRecipient: this.NFTData['oCurrentOwner']['_id'],
            eBidStatus:
              this.NFTData['eAuctionType'] == 'Fixed Sale' ? 'Sold' : 'Bid',
            nBidPrice: parseFloat(price),
            nQuantity: res.nQuantity,
            oNFTId: this.NFTData['_id'],
            sTransactionHash: '',
            nTokenID: nTokenID,
            sOwnerEmail:
              this.NFTData.oCurrentOwner &&
              this.NFTData.oCurrentOwner.sEmail &&
              this.NFTData.oCurrentOwner.sEmail != undefined
                ? this.NFTData.oCurrentOwner.sEmail
                : '-',
          };
          this.spinner.show();
          var NFTinstance = await this.apiService.exportInstance(
            environment.NFTaddress,
            environment.NFTabi
          );
          if (NFTinstance && NFTinstance != undefined) {
            this.spinner.hide();

            this.spinner.show();
            NFTinstance.methods
              .bid(
                nTokenID,
                obj['nQuantity'],
                this.NFTData.oCurrentOwner.sWalletAddress
              )
              .send({
                from: this.showObj.wallet_address,
                value: window.web3.utils.toWei(`${obj.nBidPrice}`, 'ether'),
              })
              .on('transactionHash', async (hash: any) => {
                obj['sTransactionHash'] = hash;

                await this.apiService
                  .bidCreate(obj)
                  .subscribe(async (transData: any) => {
                    this.spinner.hide();
                    if (transData && transData['data']) {
                      this.toaster.success(
                        'Bid placed successfully',
                        'Success!'
                      );
                      var magnificPopup = $.magnificPopup.instance;
                      // save instance in magnificPopup variable
                      magnificPopup.close();
                      // this.router.navigate(['/my-profile'])
                      await this.router.navigate(['/my-profile'], {
                        relativeTo: this._route,
                        queryParams: {
                          tab: 'bid',
                        },
                      });

                      // this.onClickRefresh();
                    } else {
                      this.toaster.success(transData['message'], 'Success!');
                    }
                  });
              })
              .catch((error: any) => {
                this.spinner.hide();

                this.toaster['error'](
                  error.code == 4001
                    ? 'You Denied MetaMask Transaction Signature'
                    : 'Something Went Wrong!'
                );
              });
          } else {
            this.spinner.hide();
            this.toaster.error(
              'There is something issue with NFT address.',
              'Error!'
            );
          }
        } else {
          this.spinner.hide();

          this.bidForm.patchValue({ nBidPrice: '' });
          this.toaster.info(
            'Please enter minimum & greater then minimum Bid amount.',
            'Error!'
          );
        }
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }

  onClickRefresh() {
    window.location.reload();
  }

  //BUY NFT

  async buyNft() {
    console.log('buy function called------>');
    // let approval = await NFTcontract.setApprovalForAll(contracts.NFT, true);

    console.log(this.sellerOrder[6]);
    const options = {
      from: this.account[0],
      gasPrice: 10000000000,
      gasLimit: 9000000,
      value: this.buyerOrder[6],
    };

    let sellerSign = [
      this.sellerSign[0],
      this.sellerSign[1],
      this.sellerSign[2],
    ];

    let completeOrder = await this.marketPlace.completeOrder(
      this.sellerOrder,
      sellerSign,
      this.buyerOrder,
      sellerSign,
      options
    );

    

    console.log('order completed is ---->', completeOrder);
    return completeOrder;
  }

  async onClickSubmitTransfer() {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      this.spinner.show();
      this.submitted2 = true;
      if (this.transferForm.invalid) {
        this.spinner.hide();
        return;
      } else {
        let res = this.transferForm.value;

        let nTokenID =
          (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
            ? this.NFTData.nTokenID
            : 1;
        let obj = {
          oRecipient: res.oRecipient,
          eBidStatus: 'Transfer',
          nBidPrice: '0',
          nQuantity: res.nQuantity,
          oNFTId: this.NFTData['_id'],
          sTransactionHash: '',
          nTokenID: nTokenID,
        };
        this.spinner.show();
        var NFTinstance = await this.apiService.exportInstance(
          environment.NFTaddress,
          environment.NFTabi
        );
        if (NFTinstance && NFTinstance != undefined) {
          this.spinner.hide();
          this.spinner.show();
          NFTinstance.methods
            .transfer(nTokenID, res.oRecipient, obj['nQuantity'])
            .send({
              from: this.showObj.wallet_address,
            })
            .on('transactionHash', async (hash: any) => {
              obj['sTransactionHash'] = hash;

              await this.apiService
                .bidCreate(obj)
                .subscribe(async (transData: any) => {
                  this.spinner.hide();
                  if (transData && transData['data']) {
                    this.toaster.success(
                      'NFT transfered successfully',
                      'Success!'
                    );
                    this.router.navigate(['']);
                    this.onClickRefresh();
                  } else {
                    this.toaster.success(transData['message'], 'Success!');
                  }
                });
            })
            .catch((error: any) => {
              this.spinner.hide();

              this.toaster['error'](
                error.code == 4001
                  ? 'You Denied MetaMask Transaction Signature'
                  : 'Something Went Wrong!'
              );
            });
        } else {
          this.spinner.hide();
          this.toaster.error(
            'There is something issue with NFT address.',
            'Error!'
          );
        }
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }

  async onClickSubmitBUY() {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      this.spinner.show();
      this.submitted3 = true;
      let id = this._route.snapshot.params['id'];
      // let res= await this.getNFTViewData(id)
      let res = this.NFTData;
       let SellerOrder = Object.assign({}, res.sOrder);

          for (const key in SellerOrder) {
            let index = parseInt(key);
            console.log("index is--->",index)

            switch (index) {
              case 0:
                if(res.erc721){
                  this.sellerOrder.push(SellerOrder[key]);
                }else{
                  this.sellerOrder.push(this.currentOwnersaccount);
                }
                // this.sellerOrder.push(SellerOrder[key]);
                this.buyerOrder.push(this.account[0]);
                break;
              case 1:
                this.sellerOrder.push(SellerOrder[key]);
                this.buyerOrder.push(SellerOrder[key]);
                break;
             case 3:

              if(res.erc721){
                let q=SellerOrder[key]
               let sellerQuantity=parseInt(q,10)
                this.sellerOrder.push(sellerQuantity);
                console.log("nQuantity",this.buyForm.value.nQuantity)
                let bQuant=this.buyForm.value.nQuantity;
                let quantity=parseInt(bQuant,10)

                 this.buyerOrder.push(quantity);
              }else{
                let bQuant=this.buyForm.value.nQuantity;
                let quantity=parseInt(bQuant,10)
                this.sellerOrder.push(quantity);
                this.buyerOrder.push(quantity);
              }

               
                break;
              case 5:
                this.sellerOrder.push(SellerOrder[key]);
                this.buyerOrder.push(SellerOrder[key]);
                break;
              case 6:
                let Quant=this.buyForm.value.nQuantity;
               
                if(res.erc721){
                  let cost = SellerOrder[key];
                  this.NFTprice = SellerOrder[key];
                  this.sellerOrder.push(SellerOrder[key]);
                  let price=cost.toString()
                  this.buyerOrder.push(price);
                }else{
                  this.NFTprice = this.currentOwnersOrder;
                  let price=parseFloat(this.currentOwnerPrice);
                  
                  let totalAmmount=(price*Quant).toString()
                  console.log("price is--->",price,Quant)
                  console.log("total ammount is---->",totalAmmount)
                  this.buyerOrder.push(ethers.utils.parseEther(totalAmmount));
                  this.sellerOrder.push(ethers.utils.parseEther(totalAmmount));
                }
                // this.NFTprice = SellerOrder[key];
                // this.sellerOrder.push(SellerOrder[key]);
                
                // console.log("quant is---->", this.buyForm.value.nQuantity)
                // let cost = SellerOrder[key];
                // if(res.erc721){
                //   cost = SellerOrder[key];
                // }else{
                //   cost=this.currentOwnersOrder / Quant;
                //   console.log("cost dffgd is--->",cost, res.erc721)
                // }
                
                // console.log("cost is--->",cost, res.erc721)
                // let price=cost.toString()
                // this.buyerOrder.push(price);
                break;
              case 8:
                this.sellerOrder.push([]);
                this.buyerOrder.push([]);
                break;
              case 9:
                this.sellerOrder.push([]);
                this.buyerOrder.push([]);
                break;
              default:
                this.sellerOrder.push(parseInt(SellerOrder[key]));
                this.buyerOrder.push(parseInt(SellerOrder[key]));
            }
          }

          let sign = res.sSignature;
          this.sellerSign = sign;
          let v = this.sellerSign[0];
          v = parseInt(v, 10);



          this.sellerSign[0] = v;


          console.log("seller and buyer order is---->",this.sellerOrder,this.buyerOrder)

      if (this.buyForm.invalid) {
        this.spinner.hide();
        return;
      } else {
        let res = this.buyForm.value;
        console.log('----res----------', res);
        console.log(
          '----this.NFTData.nBasePrice----------',
          this.NFTData.nBasePrice
        );

        res.nBidPrice = parseFloat(this.NFTData.nBasePrice['$numberDecimal']);
        let nTokenID =
          (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
            ? this.NFTData.nTokenID
            : 1;
        let price: any = parseFloat(res.nBidPrice) * parseFloat(res.nQuantity);
       
        this.spinner.show();
        var NFTinstance = await this.apiService.exportInstance(
          environment.NFTaddress,
          environment.NFTabi
        );
        if (NFTinstance && NFTinstance != undefined) {
          this.spinner.hide();

          this.spinner.show();
          let res1=await this.buyNft();
          let  buyres=await res1.wait()
          if(buyres.status===1){
            let obj = {
              oRecipient: this.NFTData['oCurrentOwner']['_id'],
              eBidStatus:
                this.NFTData['eAuctionType'] == 'Fixed Sale' ? 'Sold' : 'Bid',
              nBidPrice: parseFloat(price),
              nQuantity: res.nQuantity,
              oNFTId: this.NFTData['_id'],
              sTransactionHash: '',
              nTokenID: nTokenID,
              sTransactionStatus:-99,
              sOwnerEmail:
                this.NFTData.oCurrentOwner &&
                this.NFTData.oCurrentOwner.sEmail &&
                this.NFTData.oCurrentOwner.sEmail != undefined
                  ? this.NFTData.oCurrentOwner.sEmail
                  : '-',
              erc721: this.NFTData.erc721,
              nftOwner_id:this.NFTOwnerData._id
            };
            obj["sTransactionHash"] = res1.hash;
            try {
              await this.apiService
                .bidCreate(obj)
                .subscribe(async (transData: any) => {
                  this.spinner.hide();
                  if (transData && transData['data']) {
                    this.toaster.success('NFT bought successfully', 'Success!');
                    this.router.navigate(['']);
  
                    this.onClickRefresh();
                  } else {
                    this.toaster.success(transData['message'], 'Success!');
                  }
                });
            } catch (error: any) {
              this.toaster['error'](
                error.code == 4001
                  ? 'You Denied MetaMask Transaction Signature'
                  : 'Something Went Wrong!'
              );
            }
          }else{
            this.spinner.hide();
            this.toaster.success("Something Went Wrong...Try Again")
          }
          
        } else {
          this.spinner.hide();
          this.toaster.error(
            'There is something issue with NFT address.',
            'Error!'
          );
        }
        // } else {
        //   this.spinner.hide();

        //   this.bidForm.patchValue({ 'nBidPrice': '' });
        //   this.toaster.info('Please enter minimum & greater then minimum Bid amount.')
        // }
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error!');
    }
  }

  async clickAccept(obj: any) {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let nTokenID =
        (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
          ? this.NFTData.nTokenID
          : 1;

      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Accepted',
        sTransactionHash: '',
        sCurrentUserEmail:
          obj.oBidder &&
          obj.oBidder['sEmail'] &&
          obj.oBidder['sEmail'] != undefined
            ? obj.oBidder['sEmail']
            : '-',
      };

      this.spinner.show();
      var oContract = await this.apiService.exportInstance(
        environment.NFTaddress,
        environment.NFTabi
      );
      if (oContract && oContract != undefined) {
        console.log(this.showObj.wallet_address);

        oContract.methods
          .acceptBid(nTokenID, obj.oBidder.sWalletAddress, obj.nQuantity)
          .send({
            from: this.showObj.wallet_address,
          })
          .on('transactionHash', async (hash: any) => {
            this.spinner.hide();
            oOptions['sTransactionHash'] = hash;
            await this.sendData(oOptions);
            this.router.navigate(['']);
          })
          .catch((error: any) => {
            this.spinner.hide();

            if (error && error.code == 4001) {
              this.toaster.error(error['message'], 'Error!');
            }
          });
      } else {
        this.spinner.hide();
        this.toaster.error(
          'There is something issue with NFT address.',
          'Error!'
        );
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }
  async clickReject(obj: any) {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let nTokenID =
        (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
          ? this.NFTData.nTokenID
          : 1;

      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Rejected',
        sTransactionHash: '',
        sCurrentUserEmail:
          obj.oBidder &&
          obj.oBidder['sEmail'] &&
          obj.oBidder['sEmail'] != undefined
            ? obj.oBidder['sEmail']
            : '-',
      };

      this.spinner.show();
      var oContract = await this.apiService.exportInstance(
        environment.NFTaddress,
        environment.NFTabi
      );
      if (oContract && oContract != undefined) {
        oContract.methods
          .rejectBid(nTokenID, obj.oBidder.sWalletAddress)
          .send({
            from: this.showObj.wallet_address,
          })
          .on('transactionHash', async (hash: any) => {
            this.spinner.hide();
            oOptions['sTransactionHash'] = hash;
            await this.sendData(oOptions);
            this.router.navigate(['']);
          })
          .catch((error: any) => {
            this.spinner.hide();
            if (error && error.code == 4001) {
              this.toaster.error(error['message'], 'Error!');
            }
          });
      } else {
        this.spinner.hide();
        this.toaster.error(
          'There is something issue with NFT address.',
          'Error!'
        );
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }

  async clickCancel(obj: any) {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let nTokenID =
        (await this.NFTData.nTokenID) && this.NFTData.nTokenID != undefined
          ? this.NFTData.nTokenID
          : 1;

      let oOptions = {
        sObjectId: obj._id,
        oBidderId: obj.oBidder._id,
        oNFTId: this.NFTData['_id'],
        eBidStatus: 'Canceled',
        sTransactionHash: '',
      };

      this.spinner.show();
      var oContract = await this.apiService.exportInstance(
        environment.NFTaddress,
        environment.NFTabi
      );
      if (oContract && oContract != undefined) {
        oContract.methods
          .cancelBid(nTokenID, this.NFTData.oCurrentOwner.sWalletAddress)
          .send({
            from: this.showObj.wallet_address,
          })
          .on('transactionHash', async (hash: any) => {
            this.spinner.hide();
            oOptions['sTransactionHash'] = hash;
            await this.sendData(oOptions);
            this.router.navigate(['']);
          })
          .catch((error: any) => {
            this.spinner.hide();
            if (error && error.code == 4001) {
              this.toaster.error(error['message'], 'Error!');
            }
          });
      } else {
        this.spinner.hide();
        this.toaster.error(
          'There is something issue with NFT address.',
          'Error!'
        );
      }
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error!');
    }
  }

  // nNFTId: 6120eba598b61743cf49a43f
  // sSellingType: Auction
  async toggleSellingType(obj: any) {
    this.spinner.show();
    await this.apiService.toggleSellingType(obj).subscribe(
      async (transData: any) => {
        this.spinner.hide();
        if (
          transData &&
          transData['message'] &&
          transData['message'] == 'NFT Details updated'
        ) {
          this.toaster.success('Selling Type updated.', 'Success!');

          this.onClickRefresh();
        }
      },
      (err: any) => {
        this.spinner.hide();
        if (err) {
          console.log('----------er', err);
          err = err['error'];
          if (err) {
            this.toaster.error(err['message'], 'Error!');
          }
        }
      }
    );
  }




  //Signature structure
   
 


  async onClickUpdateType(type: any,id: any, nftOwnerid: any) {
        
    console.log("type is-->",type)
    console.log("calling update api-->")
    let res1 = this.saleForm.value;
    console.log("res1 for put on sale is----->",res1.orderPrice, res1)

    let res=this.NFTData
    
    let SellerOrder = Object.assign({}, res.sOrder);

    

let nftContract=res.sOrder[1]
    if (res.erc721) {
      console.log("erc721")
      let NFTcontract = await this.apiService.exportInstance(
        nftContract,
        simpleERC721ABI.abi
      );
     console.log("nft contract is--->",NFTcontract)
      let approval = await NFTcontract.isApprovedForAll(this.account[0],contracts.MARKETPLACE);
     
      if (!approval) {
        let approvalres = await NFTcontract.setApprovalForAll(contracts.MARKETPLACE, true);
        console.log("approval res",approvalres)
        
      } 
    
      
    } else {
      console.log("erc1155")
      let NFTcontract = await this.apiService.exportInstance(
        nftContract,
        simpleERC1155ABI.abi
      );

      console.log("erc1155 contract is called again--->",NFTcontract)

      let approval = await NFTcontract.isApprovedForAll(this.account[0],contracts.MARKETPLACE);
     
      if (!approval) {
        let approvalres = await NFTcontract.setApprovalForAll(contracts.MARKETPLACE, true);
       
      } 
    }



    let newSellerOrder=Object.values(SellerOrder);
    console.log("seller order is--->",newSellerOrder)

       for (const key in SellerOrder) {
         let index = parseInt(key);

         switch (index) {
           case 0:
            newSellerOrder[0]=this.account[0];
             
             break;
           case 1:
            newSellerOrder[1]=SellerOrder[key];
             
             break;
          case 3:
            if (res.erc721) {
              newSellerOrder[3]=SellerOrder[key];
            }else{
              newSellerOrder[3]=res1.nQuantity;
            }
            
             break;
           
           case 6:
            if (res.erc721) {
              newSellerOrder[6]=ethers.utils.parseEther(res1.orderPrice);
            }else{
              let sellerprice = res1.orderPrice*res1.nQuantity;
              newSellerOrder[6] = ethers.utils.parseEther(sellerprice.toString());
              // newSellerOrder[6]=ethers.utils.parseEther(sellerprice.toString());
              // newSellerOrder[6]=sellerprice;
            }
            
             break;
          
           default:break;
            
         }
       }

       console.log("new sellerOrder is---->",newSellerOrder)
       let signature = await this.getSignature(this.account[0],...newSellerOrder);
          
       console.log("signature is---->",signature)





     let data = {
       _id:this.NFTData._id,
       eAuctionType : this.NFTOwnerData.eAuctionType,
       nftownerID : this.NFTOwnerData._id,
       sTransactionStatus:1,
       sOrder:newSellerOrder,
       sSignature:signature,
       nBasePrice:res1.orderPrice
     }
     console.log("data to be updated is---->",data);
    
    
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
     let res1=await this.apiService.updateNFTOrder(data).subscribe(
      async (transData: any) => {
        console.log('-----------transData----------', transData);
        this.spinner.hide();
        if (
          transData &&
          transData['message'] &&
          transData['message'] == 'Order Created success'
        ) {
          this.toaster.success('NFT ON SALE .', 'Success!');

          this.onClickRefresh();
        }
      },
      (err: any) => {
        this.spinner.hide();
        if (err) {
          console.log('----------er', err);
          err = err['error'];
          if (err) {
            this.toaster.error(err['message'], 'Error!');
          }
        }
      }
    );
     
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error');
    }
  }
  async sendData(opt: any) {
    this.spinner.show();
    await this.apiService
      .toggleBidStatus(opt)
      .subscribe(async (transData: any) => {
        this.spinner.hide();
        if (transData && transData['data']) {
          this.toaster.success(
            'Bid status updated. it will be Reflected once Transaction is mined.',
            'Success!'
          );

          this.onClickRefresh();
        } else {
          this.toaster.success(transData['message'], 'Success!');
        }
      });
  }

  clickClose() {
    var magnificPopup = $.magnificPopup.instance;
    // save instance in magnificPopup variable
    magnificPopup.close();
  }

  clickOpen() {
    $.magnificPopup.open({
      items: {
        src: '#modal-tran',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });

    // $('#modal-tran').magnificPopup('open');
  }

  buyModal(){
    $.magnificPopup.open({
      items: {
        src: '#modal-buy',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });

  }

  buyModalOwner(price, quantity, nftownr,  sOrder){
    
    this.currentOwnerPrice = price;
    this.currentOwnerQty = quantity;
    this.currentOwnersaccount = nftownr;
    this.currentOwnersOrder = sOrder;
    console.log("sorder" + this.currentOwnerPrice + this.currentOwnersOrder);
    this.buildBUYForm();
    $.magnificPopup.open({
      items: {
        src: '#modal-buy-owner',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  putOnSaleModal(){
    $.magnificPopup.open({
      items: {
        src: '#modal-sale',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });

  }

  // --TODO
  async onClickSubmitChangePrice() {
    this.spinner.show();
    this.submitted4 = true;
    if (this.changePriceForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      let resp = this.changePriceForm.value;
      let obj = {
        nNFTId: this.NFTData._id,
        nBasePrice: resp.nBasePrice,
      };

      this.spinner.show();
      await this.apiService.updateBasePrice(obj).subscribe(
        async (transData: any) => {
          console.log('-----------transData----------', transData);
          this.spinner.hide();
          if (
            transData &&
            transData['message'] &&
            transData['message'] == 'Price updated'
          ) {
            this.toaster.success('Price updated.', 'Success!');

            this.onClickRefresh();
          }
        },
        (err: any) => {
          this.spinner.hide();
          if (err) {
            console.log('----------er', err);
            err = err['error'];
            if (err) {
              this.toaster.error(err['message'], 'Error!');
            }
          }
        }
      );
    }
  }

  onClickOPENPRICE() {
    $.magnificPopup.open({
      items: {
        src: '#modal-change-price',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  clickLike(id: any) {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      this.apiService.like({ id: id }).subscribe(
        (updateData: any) => {
          this.spinner.hide();

          if (updateData && updateData['data']) {
            // this.toaster.success(updateData['message'], 'Success!')
            this.onClickRefresh();
          } else {
          }
        },
        (err: any) => {
          this.spinner.hide();
          if (err && err['message']) {
          }
        }
      );
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.');
    }
  }

  //-------------------------- auction_end_date

  onClickOPENAUCTION(type: any, id: any) {
    this.sellingType = type;
    this.id = id;

    $.magnificPopup.open({
      items: {
        src: '#modal-auction',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }

  onClickSubmitPutonTimeAuction() {
    if (
      localStorage.getItem('Authorization') &&
      localStorage.getItem('Authorization') != null
    ) {
      let obj: any = {
        nNFTId: this.id,
        sSellingType: this.sellingType,
      };

      let fd = this.timedAuctionForm.value;

      if (
        fd &&
        fd.days &&
        fd.days != undefined &&
        fd.days != null &&
        fd.days != ''
      ) {
        var dt = new Date();
        dt.setDate(dt.getDate() + parseInt(fd.days));

        obj.auction_end_date = dt;
      }

      this.toggleSellingType(obj);
    } else {
      // this.router.navigate(['']);
      this.toaster.error('Please sign in first.', 'Error');
    }
  }

  ConvertSectoDay(n: any) {
    let day: any = n / (24 * 3600);

    n = n % (24 * 3600);
    let hour: any = n / 3600;

    n %= 3600;
    let minutes: any = n / 60;

    n %= 60;
    let seconds: any = n;

    let a = '';

    if (parseInt(day) != 0) {
      this.auct_time.days = parseInt(day);
    }
    if (parseInt(hour) != 0) {
      this.auct_time.hours = parseInt(hour);
    }
    if (parseInt(minutes) != 0) {
      this.auct_time.mins = parseInt(minutes);
    }
    if (parseInt(seconds) != 0) {
      this.auct_time.secs = parseInt(seconds);
    }
    console.log('------------------------a', this.auct_time);
  }

  //

  onClickAdd() {
    $.magnificPopup.open({
      items: {
        src: '#modal-add-funds',
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,
        overflowY: 'auto',
        preloader: false,
        focus: '#username',
        modal: false,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        callbacks: {
          beforeOpen: function () {
            if ($(window).width() < 700) {
              // this.st.focus = false;
            } else {
              // this.st.focus = '#name';
            }
          },
        },
      },
    });
  }
}
