class BaseShear15 {
    constructor(zone, nv, ca, cv, importanceFactor, responseModification, period, weight) {
        this.zone = zone;
        this.nv = nv;
        this.ca = ca;
        this.cv = cv;
        this.importanceFactor = importanceFactor;
        this.responseModification = responseModification;
        this.period = period;
        this.weight = weight;
    }

    totalBaseShear() {
        // Equation 208-08
        return ((this.cv * this.importanceFactor) / (this.responseModification * this.period)) * this.weight;
    }

    maxBaseShear() {
        // Equation 208-09
        const CONSTANT = 2.5;
        return ((CONSTANT * this.ca * this.importanceFactor) / this.responseModification) * this.weight;
    }

    minBaseShear() {
        // Equation 208-10
        const CONSTANT = 0.11;
        return CONSTANT * this.ca * this.importanceFactor * this.weight;
    }

    minBaseShearZ4() {
        // Equation 208-11
        const CONSTANT = 0.8;
        return ((CONSTANT * this.nv * this.importanceFactor * 0.4) / this.responseModification) * this.weight;
    }

    // governingShear() {
    //     let governShear;
    //     if (this.zone === 4) {
    //         let governShearMax = Math.min(this.totalBaseShear(), this.maxBaseShear());
    //         let governShearMin = Math.max(this.minBaseShear(), this.minBaseShearZ4());
    //         governShear = Math.max(governShearMax, governShearMin);

    //         if (this.minBaseShearZ4() > this.totalBaseShear()) {
    //             governShear = this.minBaseShear();
    //         } else if (this.totalBaseShear() > this.maxBaseShear()) {
    //             governShear = this.maxBaseShear();
    //         } else {
    //             governShear = this.totalBaseShear();
    //         }
    //     } else {
    //         let governShearMax = Math.min(this.totalBaseShear(), this.maxBaseShear());
    //         governShear = Math.max(governShearMax, this.minBaseShear());
    //     }

    //     return governShear;
    // }
    governingShear() { 
        let governShear;
        if (this.zone === 4) {
            let governShearMax = Math.min(this.totalBaseShear(), this.maxBaseShear());
            // let governShearMin = Math.max(this.minBaseShear(), this.minBaseShearZ4()); // Commented out
            governShear = governShearMax; // Modified to only use governShearMax
    
            // if (this.minBaseShearZ4() > this.totalBaseShear()) {
            //     governShear = this.minBaseShear(); // Commented out
            // } else 
            if (this.totalBaseShear() > this.maxBaseShear()) {
                governShear = this.maxBaseShear();
            } else {
                governShear = this.totalBaseShear();
            }
        } else {
            let governShearMax = Math.min(this.totalBaseShear(), this.maxBaseShear());
            governShear = governShearMax; // Modified to only use governShearMax
            // governShear = Math.max(governShearMax, this.minBaseShear()); // Commented out
        }
    
        return governShear;
    }
}

// // Example usage:
// const dataOne = new BaseShear(4, 1.20, 0.44, 0.768, 1, 8.5, 0.82, 56898.60);
// console.log(dataOne.totalBaseShear());
// console.log(dataOne.maxBaseShear());
// console.log(dataOne.minBaseShear());
// console.log(dataOne.minBaseShearZ4());
// console.log(dataOne.governingShear());
