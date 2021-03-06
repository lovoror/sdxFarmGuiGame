/**
* Created by rodey on 15/2/9.
*/

class PlasticGuideController {

    private step:number = 0;
    public finishStep: number;
    public static LAST_STEP: number = 10;
    private win: egret.DisplayObject;
    private building: ProcessFactoryBuilding;
    public static BASE:number = 400;

    //================================================================================
    private static _instance:PlasticGuideController;

    public static getInstance():PlasticGuideController
    {
        if(!PlasticGuideController._instance)
        {
            PlasticGuideController._instance = new PlasticGuideController();
        }
        return this._instance;
    }

    public static get instance(): PlasticGuideController{
        return PlasticGuideController.getInstance();
    }

    constructor(){

    }

    public startGuide(): void{

        if(!this.isInPlasticGuide()){
            //公告
            //NoticeController.instance.init();
            return;
        }

        this.rewindStep();
        this.guide();

    }

    public rewind():void
    {

        if(!this.isInPlasticGuide()){
            return;
        }

        //关闭面板
        //UIMgr.instance.closeCurrentPanel();

        this.rewindStep(7);

        this.guide();
    }

    public rewindStep(rewindStep?: number):void
    {
        var mm: GuideModel = GuideModel.getModelByStep(PlasticGuideController.BASE, this.step);
        this.step = rewindStep || mm.rewindStep;
    }

    public nextStep(add:number = 1): void{

        if(!this.isInPlasticGuide()){
            return;
        }

        this.addStep(add);
        this.guide();

        GuideManager.getInstance().changeStep(PlasticGuideController.BASE + this.step);

    }

    public backStep(step:number):void
    {
        if(this.isInPlasticGuide())
        {
            this.setStep(step);

            this.guide();
        }
    }

    public isInPlasticGuide():boolean
    {
        if(PlasticGuideController.LAST_STEP >= this.step)
        {
            return true;
        }
        return false;
    }

    //===================================================
    public setStep(step:number):void
    {
        this.step = step;
    }

    public addStep(add:number):void
    {
        this.step += add;
    }

    public remove(): void{
        GuideManager.getInstance().clear();
        DragLogic.getInstance().setLock(false);
    }

    //----------------------------------------------------------



    public guide(): void{


        if(!this.isInPlasticGuide())
        {
            GuideManager.getInstance().clear();
            DragLogic.getInstance().setLock(false);

            console.log("==========================plastic product guide finish, turn to product guide");

            return;
        }
        console.log("==========================plastic product guide current step:", this.step);

        var mm: GuideModel = GuideModel.getModelByStep(PlasticGuideController.BASE, this.step);
        var tar:egret.DisplayObject;

        var animal:Animal;

        GuideManager.getInstance().addGuide();

        if(mm.promptType)
        {
            GuideManager.getInstance().addWomanSayUI(mm.promptType, StringUtils.toPoint(mm.npcPos, "*"), mm.promptTxt);
        }
        if(mm.circlePos)
        {
            GuideManager.getInstance().addCircle(StringUtils.toPoint(mm.circlePos, "*"));
        }
        if(mm.fingerType)
        {
            GuideManager.getInstance().addFinger(mm.fingerType, mm.fingerTrack, mm.time);
        }

        var self = this;
        var building: ProcessFactoryBuilding = <ProcessFactoryBuilding>GetBuildingUtils.getInstance().getTheBuildingInGuide(BuildingID.PLASTIC_PRODUCT);

        switch(this.step)
        {

            case 0:

                GuideManager.getInstance().addTouchPass();
                break;
            case 1:
                //定位商店图标
                tar = this.getShopIcon();
                GuideManager.getInstance().addBlocks(tar);
                break;
            case 2:
                //定位作坊栏目
                tar = this.getShopCate();
                GuideManager.getInstance().addBlocks(tar);

                break;
            case 3:
                //选择面包店
                tar = this.getShopItem(2);
                GuideManager.getInstance().addBlocks(tar);

                break;
            case 4:
                //选择某个位置
                DragLogic.getInstance().setLock(false);

                break;
            case 5:
                //准备生产面包
                DragLogic.getInstance().setLock(true);
                this.toProductPlan(building);

                break;
            case 6:
                //点击面板房，定位到面包房building
                tar = GetBuildingUtils.getInstance().getTheBuildingInGuide(BuildingID.PLASTIC_PRODUCT);
                Camera.getInstance().focus(<BuildingIso>tar, function(){
                    self.addBlocksByTheProduct();
                });
                //PickupLogic->pickup

                break;
            case 7:
                //拖动生产动画
                tar = this.getProductItem();
                GuideManager.getInstance().addBlocks(tar);

                break;
            case 8:
                //拖动生产

                break;
            case 9:
                //钻石加速

                if(this.win){
                    if(building.haveComplateProduct()){
                        this.nextStep();
                        return;
                    }
                    tar = this.getSpeedButton();
                    GuideManager.getInstance().addBlocks(tar, .6, .5);
                    //GuideManager.getInstance().addBlocks(tar);
                }else{

                    //弹出生产建筑面板
                    this.getWindow();
                    building.show();
                }

                break;
            case 10:
                //收获
                if(!this.win){
                    this.getWindow();
                    building.show();
                    return;
                }

                tar = this.getComplate();
                GuideManager.getInstance().addBlocks(tar);

                break;

        }

    }

    public autoComplate(): void{

        var self = this;

        GuideManager.getInstance().addForbiden();

        if(!this.isInPlasticGuide()){
            return;
        }
        var stim: any = window.setTimeout(function(){
            window.clearTimeout(stim);

            //新手引导
            self.setStep(9);
            self.nextStep();

            stim = null;
            delete stim;

        }, 500);

    }

    public getShopIcon(): egret.DisplayObject{
        return GameUI.instance.shop;
    }

    public getShopCate(): egret.DisplayObject{
        var win: any = UIMgr.instance.getPanel( PanelName.SHOPPING_PANEL );
        return win.getShopCate();
    }

    public getShopItem(buildingId: number = BuildingID.BREAD_PRODUCT): egret.DisplayObject{
        var win: any = UIMgr.instance.getPanel( PanelName.SHOP_CATE_PANEL );
        return win.getShopItem(buildingId);
    }

    public getProductItem(): egret.DisplayObject{
        var win: any = this.getWindow();
        return win.getFirstProduct();
    }

    public getSpeedButton(): egret.DisplayObject{
        var win: any = this.getWindow();
        return win.getSpeedButton();
    }

    public getComplate(): egret.DisplayObject{
        var win: any = this.getWindow();
        return  win.getFirstComplateProduct();
    }

    public getBuyButton(): egret.DisplayObject{
        var building: BuildingIso = GetBuildingUtils.getInstance().getBuildingByBuildingId(BuildingID.PLASTIC_PRODUCT);
        return building.bottom;
    }

    private getWindow(): egret.DisplayObject{
        if(!this.win){
            this.win = UIMgr.instance.getPanel( PanelName.PRODUCTION_PANEL );
        }
        return this.win;
    }

    private addBlocksByTheProduct():void
    {
        var tar:BuildingIso;
        var anchorX:number;
        var anchorY:number;

        tar = GetBuildingUtils.getInstance().getTheBuildingInGuide(BuildingID.PLASTIC_PRODUCT);
        //anchorX = NumberUtils.decimal_K((tar.width + tar.model.offsetX) / tar.width, 1);
        //anchorY = NumberUtils.decimal_K((tar.height + tar.model.offsetY) / tar.height, 1);
        anchorX = .5;
        anchorY = .6;
        GuideManager.getInstance().addBlocks(tar, anchorX, anchorY);
    }

    private toProductPlan(building: ProcessFactoryBuilding): void{
        var self = this;
        if( null == building )
        {
            return;
        }
        if(!building.restoreLogic.cnt || building.restoreLogic.cnt < 0){

            self.nextStep();
            return;

        }else{

            GuideManager.getInstance().addForbiden();

            var needTime: number = building.model.needTime;
            console.log('生产所需要的时间：', needTime);
            var stim: any = window.setTimeout(function(){
                window.clearTimeout(stim);

                //GuideManager.getInstance().addTouchPass();
                self.nextStep();

                stim = null;
                delete stim;

            }, (needTime + .5) * 1000);

        }

    }


}
