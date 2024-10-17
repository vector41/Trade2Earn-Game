"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.WebHookMessageType = void 0;
var WebHookMessageType;
(function (WebHookMessageType) {
    WebHookMessageType["USER_DEPOSIT"] = "UserDeposit";
    WebHookMessageType["USER_WITHDRAWAL"] = "UserWithdrawal";
})(WebHookMessageType || (exports.WebHookMessageType = WebHookMessageType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["SUCCESS"] = "Success";
    OrderStatus["PROCESSING"] = "Processing";
    OrderStatus["FAILED"] = "Failed";
    OrderStatus["WAITING_APPROVAL"] = "WaitingApproval";
    OrderStatus["SUBMITTED"] = "Submitted";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
