const network = await provider.getNetwork();
    console.log("Trying to do it");
    const total = ethers.utils.parseUnits(
      cartItems.reduce((a, c) => a + c.quantity * c.price, 0).toString()
    );
    console.log(total);
    const cTotal =
      cart.paymentMethod == "ETH" || cart.paymentMethod == "WETH"
        ? total
        : ethers.utils.parseUnits(
            (
              cartItems.reduce((a, c) => a + c.quantity * c.price, 0) *
              conversion
            )
              .toFixed(6)
              .toString(),
            6
          );
    const URcontract = new Contract(
      UNIVERSAL_ROUTER_ADDRESS(1),
      uniAbi.abi,
      provider
    );
    console.log("CONTRACT", URcontract);
    const ETHER = Ether.onChain(1);
    let trades = [];
    if (cart.paymentMethod !== "ETH") {
      const block = await provider.getBlockNumber();
      const tradePool = await getPool(cart.paymentMethod, block);
      const poolToken = await getToken(cart.paymentMethod);
      console.log(tradePool);
      console.log(poolToken);
      console.log("SIGNER", signer);
      const ERC20 = new Contract(poolToken.address, IERC20.abi, provider);
      const permitApp = await ERC20.connect(signer).approve(
        PERMIT2_ADDRESS,
        BigNumber.from(2).pow(160).sub(1)
      );
      console.log("permitApproval", permitApp);
      const permit2 = new Contract(PERMIT2_ADDRESS, permitABI.abi, provider);
      const tokenApproval = await permit2
        .connect(signer)
        .approve(
          poolToken.address,
          UNIVERSAL_ROUTER_ADDRESS(1),
          BigNumber.from(2).pow(160).sub(1),
          Math.floor(Date.now() / 1000 + 18000000)
        );
      console.log(tokenApproval);
      // let all = new AllowanceProvider(provider, PERMIT2_ADDRESS);
      // console.log(
      //   "NONCE",
      //   await all.getAllowanceData(
      //     poolToken.address,
      //     address,
      //     UNIVERSAL_ROUTER_ADDRESS(1)
      //   )
      // );
      // let nonce = 0;
      // let permitDetails = {
      //   token: poolToken.address,
      //   amount: BigNumber.from(2).pow(160).sub(1),
      //   expiration: Math.floor(Date.now() / 1000 + 1800),
      //   nonce: nonce,
      // };
      // let permitSingle = {
      //   details: permitDetails,
      //   spender: UNIVERSAL_ROUTER_ADDRESS(1),
      //   sigDeadline: Math.floor(Date.now() / 1000 + 1800),
      // };
      // const { domain, types, values } = AllowanceTransfer.getPermitData(
      //   permitSingle,
      //   PERMIT2_ADDRESS,
      //   31337
      // );
      // console.log("SIG DETS", domain, types, values);
      // const sig = await signer._signTypedData(domain, types, values);
      // console.log("SIGNAT", sig);
      // let tokenApp = await permit2[
      //   "permit(address, ((address, uint160, uint48, uint48), address, uint256), bytes)"
      // ](address, permitSingle, sig);
      // console.log("token approval", tokenApp);
      const routerTrade = buildTrade([
        await V3Trade.fromRoute(
          new RouteV3([tradePool], poolToken, ETHER),
          CurrencyAmount.fromRawAmount(ETHER, total),
          TradeType.EXACT_OUTPUT
        ),
      ]);
      console.log(routerTrade);
      const uniswapTrade = new UniswapTrade(routerTrade, {
        slippageTolerance: new Percent(5, 100),
        recipient: ROUTER_AS_RECIPIENT,
      });
      console.log("uniswapTrade", uniswapTrade);
      trades.push(uniswapTrade);
    }

    const openseaItems = cartItems.filter((item) => item.opensea == true);
    console.log(openseaItems);
    if (openseaItems.length !== 0) {
      const openseaData = await getSeaportData(openseaItems, provider, address);
      const seaportTrade = new SeaportTrade([openseaData]);
      console.log("seaportTrade", seaportTrade);
      console.log("value", seaportTrade.getTotalOrderPrice(openseaData));
      trades.push(seaportTrade);
    }

    const looksrareItems = cartItems.filter((item) => item.opensea == false);
    if (looksrareItems.length !== 0) {
      let tokenTypes = [];
      for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].opensea == false) {
          tokenTypes.push(gatewayList[i].type);
        }
      }
      for (let i = 0; i < looksrareItems.length; i++) {
        let looksRareData = await getLooksrareData(
          looksrareItems[i],
          address,
          tokenTypes[i]
        );
        console.log(looksRareData);
        let looksRareTrade = new LooksRareTrade([looksRareData]);
        trades.push(looksRareTrade);
      }
    }
    console.log("TRADES", trades);
    const methodParameters = SwapRouter.swapCallParameters(trades, {
      sender: address,
    });

    console.log(methodParameters.calldata);
    console.log(methodParameters.value);
    try {
      console.log("SIGNER", signer);
      const transactionParameters = {
        from: address,
        to: UNIVERSAL_ROUTER_ADDRESS(1),
        data: methodParameters.calldata,
        value: methodParameters.value,
        gasLimit: 500000,
      };

      const transactionResponse = await signer.sendTransaction(
        transactionParameters
      );
      console.log("RESPONSE", transactionResponse);
      const txReceipt = await transactionResponse.wait(1);
      // const transactionResponse = await ethereum.request({
      //   method: "eth_sendTransaction",
      //   params: [transactionParameters],
      // });

      console.log(txReceipt);
    }