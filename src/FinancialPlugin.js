export default (financialStartMonth=4) => {
  const zeroBasedMonth = financialStartMonth - 1;

  return (option, dayjsClass, dayjsFactory) => {
    dayjsClass.prototype.financialQuarter = function () {
      const quarter = Math.floor((this.month() / 3) - (zeroBasedMonth / 3)) + 1;
      return quarter > 0 ? quarter : 4;
    };
  
    dayjsClass.prototype.financialYear = function () {
      const quarter = this.financialQuarter();
      return quarter === 4 ? this.year() - 1 : this.year();
    };

    const oldStartOf = dayjsClass.prototype.startOf;
    dayjsClass.prototype.startOf = function (units, startOf) {
      if (units === "financialYear") {
        if (this.financialQuarter() === 4) {
          return oldStartOf.bind(this.startOf("financialQuarter"))("year").month(zeroBasedMonth);
        }
        return oldStartOf.bind(this)("year").month(zeroBasedMonth);
      }
  
      if (units === "financialQuarter") {
        const actualMonth = this.month() + 1;
        const left = Math.round(actualMonth % 3) - 1;
        const subMonth = left < 0 ? 2 : left;
        return this.subtract(subMonth, "month").startOf("month");
      }
  
      return oldStartOf.bind(this)(units, startOf);
    };
  
    const oldEndOf = dayjsClass.prototype.endOf;
    dayjsClass.prototype.endOf = function (units, endOf) {
      if (units === "financialYear") {
        let start;
        if (this.financialQuarter() === 4) {
          start = oldStartOf.bind(this)("year").subtract(1, "year").month(zeroBasedMonth);
        }
        start = oldStartOf.bind(this)("year").month(zeroBasedMonth);
        return start.add(11, "month").endOf("month");
      }
      if (units === "financialQuarter") {
        return this.startOf("financialQuarter").add(2, "month").endOf("month");
      }
      return oldEndOf.bind(this)(units, endOf);
    };
  
  
    const oldisSame = dayjsClass.prototype.isSame;
    dayjsClass.prototype.isSame = function (date, units) {
      
      if (units === "financialYear") {
        const originalYear = this.financialYear()
        const compareYear = dayjsFactory(date).year();
        return originalYear === compareYear;
      }
  
      if (units === "financialQuarter") {
        const originalQuarter = this.financialQuarter();
        const compareQuarter = dayjsFactory(date).financialQuarter();
        return originalQuarter === compareQuarter;
      }
  
      return oldisSame.bind(this)(date, units);
    }
  };
}


