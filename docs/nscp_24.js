class BaseShear24 {
    constructor(ss, s1, importanceFactor, fa, fv, rFactor, period, longPeriod) {
        this.ss = ss;
        this.s1 = s1;
        this.importanceFactor = importanceFactor;
        this.fa = fa;
        this.fv = fv;
        this.rFactor = rFactor;
        this.period = period;
        this.longPeriod = longPeriod;
    }

    sms() {
        // Equation 11.4-1 | Variable SMs
        return this.fa * this.ss;
    }

    sm1() {
        // Equation 11.4-2 | Variable SM1
        return this.fv * this.s1;
    }

    sds() {
        // Equation 11.4-3 | Variable SDs
        const CONSTANT = 2 / 3;
        return CONSTANT * this.sms();
    }

    sd1() {
        // Equation 11.4-4 | Variable SD1
        const CONSTANT = 2 / 3;
        return CONSTANT * this.sm1();
    }

    totalBaseShear() {
        return this.sds() / (this.rFactor / this.importanceFactor);
    }

    minBaseShear() {
        // Check minimum if Cs is 0.01 is lower
        const csMin = 0.044 * this.sds() * this.importanceFactor;
        
        if (this.s1 <= 0.6) {
            return Math.max((0.5 * this.s1) / (this.rFactor / this.importanceFactor), 0.05); // Equation 12
        } else {
            return Math.max(0.05, csMin);
        }
    }

    maxBaseShear() {
        let cs;
        if (this.period < this.longPeriod) {
            cs = this.sds() / (this.period * (this.rFactor / this.importanceFactor));
        } else {
            cs = (this.sds() * this.longPeriod) / (Math.pow(this.period, 2) * (this.rFactor / this.importanceFactor));
        }
        return cs;
    }

    governingShear() {
        let governShear;
        if (this.minBaseShear() > this.totalBaseShear()) {
            governShear = this.minBaseShear();
        } else if (this.totalBaseShear() > this.maxBaseShear()) {
            governShear = this.maxBaseShear();
        } else {
            governShear = this.totalBaseShear();
        }
        return governShear;
    }
}

// // Example usage:
// const dataOne = new BaseShear(1.0, 0.5, 1.0, 1.2, 1.4, 8.5, 0.82, 4.0);
// console.log(dataOne.sms());
// console.log(dataOne.sm1());
// console.log(dataOne.sds());
// console.log(dataOne.sd1());
// console.log(dataOne.totalBaseShear());
// console.log(dataOne.minBaseShear());
// console.log(dataOne.maxBaseShear());
// console.log(dataOne.governingShear());
