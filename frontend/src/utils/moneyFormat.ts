export function moneyFormat(money: number): string {
    if (money === undefined || money === null) return "N/A";
    if (money < 0) return "Invalid amount";
    if (money === 0) return "$0";

    if(money >= 1e9) {
        return (money / 1e9).toFixed(1) + "B $";
    } else if(money >= 1e6) {
        return (money / 1e6).toFixed(1) + "M $";
    } else if(money >= 1e3) {
        return (money / 1e3).toFixed(1) + "K $";
    }

    return money.toString();
}