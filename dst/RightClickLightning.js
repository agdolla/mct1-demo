"use strict";
// public PlayerInteractEvent(final Player who, final Action action, final ItemStack item, final Block clickedBlock, final BlockFace clickedFace) {
// 	super(who);
// 	this.action = action;
// 	this.item = item;
// 	this.blockClicked = clickedBlock;
// 	this.blockFace = clickedFace;
// 	useItemInHand = Result.DEFAULT;
// 	useClickedBlock = clickedBlock == null ? Result.DENY : Result.ALLOW;
// 	who.performCommand("whateverthecommandisyouwanttoexecuteputithere");
// 	}
// 	public Action getAction() {
// 	return action;
// 	}
// 	public boolean isCancelled() {
// 	return useInteractedBlock() == Result.DENY;
// 	}
// 	public void setCancelled(boolean cancel) {
// 	setUseInteractedBlock(cancel ? Result.DENY : useInteractedBlock() == Result.DENY ? Result.DEFAULT : useInteractedBlock());
// 	setUseItemInHand(cancel ? Result.DENY : useItemInHand() == Result.DENY ? Result.DEFAULT : useItemInHand());
// 	}
// 	public ItemStack getItem() {
// 	return this.item;
// 	}
// 	public Material getMaterial() {
// 	if (!hasItem()) {
// 	return Material.AIR;
// 	}
// 	return item.getType();
// 	}
// 	public boolean hasBlock() {
// 	return this.blockClicked != null;
// 	}
// 	public boolean hasItem() {
// 	return this.item != null;
// 	}
// 	public boolean isBlockInHand() {
// 	if (!hasItem()) {
// 	return false;
// 	}
// 	return item.getType().isBlock();
// 	}
// 	public Block getClickedBlock() {
// 	return blockClicked;
// 	}
// 	public BlockFace getBlockFace() {
// 	return blockFace;
// 	}
// 	public Result useInteractedBlock() {
// 	return useClickedBlock;
// 	}
// 	public void setUseInteractedBlock(Result useInteractedBlock) {
// 	this.useClickedBlock = useInteractedBlock;
// 	}
// 	public Result useItemInHand() {
// 	return useItemInHand;
// 	}
// 	public void setUseItemInHand(Result useItemInHand) {
// 	this.useItemInHand = useItemInHand;
// 	}
// 	@Override
// 	public HandlerList getHandlers() {
// 	return handlers;
// 	}
// 	public static HandlerList getHandlerList() {
// 	return handlers;
// 	}
// 	} 
