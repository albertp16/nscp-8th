const nearSource = {
    "Na": {
        "2": { "A": 1.5, "B": 1.3, "C": 1.0 },
        "5": { "A": 1.2, "B": 1.0, "C": 1.0 },
        "10": { "A": 1.0, "B": 1.0, "C": 1.0 }
    },
    "Nv": {
        "2": { "A": 2.0, "B": 1.6, "C": 1.0 },
        "5": { "A": 1.6, "B": 1.2, "C": 1.0 },
        "10": { "A": 1.2, "B": 1.0, "C": 1.0 },
        "15": { "A": 1.0, "B": 1.0, "C": 1.0 }
    }
};

const siteCoefficient = {
    "Ca": {
        "s_a": { "2": 0.16, "4": 0.32 },
        "s_b": { "2": 0.20, "4": 0.40 },
        "s_c": { "2": 0.24, "4": 0.40 },
        "s_d": { "2": 0.28, "4": 0.44 },
        "s_e": { "2": 0.34, "4": 0.44 }
    },
    "Cv": {
        "s_a": { "2": 0.16, "4": 0.32 },
        "s_b": { "2": 0.20, "4": 0.40 },
        "s_c": { "2": 0.32, "4": 0.56 },
        "s_d": { "2": 0.40, "4": 0.64 },
        "s_e": { "2": 0.64, "4": 0.96 }
    }
};

class NscpCoef {
    constructor(distance, sourceType, soilType, zone) {
        this.distance = distance;
        this.sourceType = sourceType;
        this.soilType = soilType;
        this.zone = zone;
    }

    interpolate(val1, val2, distDiff) {
        return val1 - ((val1 - val2) * distDiff);
    }

    getNearSource(factor) {
        const distances = Object.keys(nearSource[factor]);
        let val1 = nearSource[factor][distances[0]][this.sourceType];
        let val2, distDiff;

        for (let i = 1; i < distances.length; i++) {
            if (this.distance <= distances[i]) {
                val2 = nearSource[factor][distances[i]][this.sourceType];
                distDiff = (this.distance - distances[i - 1]) / (distances[i] - distances[i - 1]);
                return this.interpolate(val1, val2, distDiff);
            }
            val1 = nearSource[factor][distances[i]][this.sourceType];
        }
        return val1;
    }

    getCoefficient(factor) {
        const coef = siteCoefficient[factor][this.soilType][this.zone];
        const nearSourceFactor = this.getNearSource(factor === 'Ca' ? 'Na' : 'Nv');
        return this.zone === '2' ? coef : coef * nearSourceFactor;
    }

    na() { return this.getNearSource('Na'); }
    nv() { return this.getNearSource('Nv'); }
    ca() { return this.getCoefficient('Ca'); }
    cv() { return this.getCoefficient('Cv'); }
}



// Interpolation function
function interpolate(deltaY, deltaX, step) {
    const slope = deltaY / deltaX; // Linear interpolation slope
    return slope * step; // Calculated interpolated value
}



function interpolateFv(value, left, right) {
    let a = (value - left) / 0.10;
    let b = left - right;
    return left - (a * b);
}

function sitecoefficients(soilTypeInput, SsInput, S1Input) {
    let Ss = SsInput;
    let SOne = S1Input;
    let siteClass = '';

    switch (soilTypeInput) {
        case "s_a":
            siteClass = "A";
            break;
        case "s_b":
            siteClass = "B";
            break;
        case "s_c":
            siteClass = "C";
            break;
        case "s_d":
            siteClass = "D";
            break;
        case "s_e":
            siteClass = "E";
            break;
    }

    let Fa, Fv;

    if (Ss <= 0.25) {
        switch (siteClass) {
            case "A":
                Fa = 0.8;
                break;
            case "B":
                Fa = 1.0;
                break;
            case "C":
                Fa = 1.2;
                break;
            case "D":
                Fa = 1.6;
                break;
            case "E":
                Fa = 2.5;
                break;
        }
    } else if (Ss > 0.25 && Ss <= 0.5) {
        switch (siteClass) {
            case "A":
                Fa = 0.8;
                break;
            case "B":
                Fa = 1.0;
                break;
            case "C":
                Fa = 1.2;
                break;
            case "D":
                Fa = interpolate(Ss, 1.6, 1.4);
                break;
            case "E":
                Fa = interpolate(Ss, 2.5, 1.7);
                break;
        }
    } else if (Ss > 0.5 && Ss <= 0.75) {
        switch (siteClass) {
            case "A":
                Fa = 0.8;
                break;
            case "B":
                Fa = 1.0;
                break;
            case "C":
                Fa = interpolate(Ss, 1.2, 1.1);
                break;
            case "D":
                Fa = interpolate(Ss, 1.4, 1.2);
                break;
            case "E":
                Fa = interpolate(Ss, 1.7, 1.2);
                break;
        }
    } else if (Ss > 0.75 && Ss <= 1.00) {
        switch (siteClass) {
            case "A":
                Fa = 0.8;
                break;
            case "B":
                Fa = 1.0;
                break;
            case "C":
                Fa = interpolate(Ss, 1.1, 1.0);
                break;
            case "D":
                Fa = interpolate(Ss, 1.2, 1.1);
                break;
            case "E":
                Fa = interpolate(Ss, 1.2, 0.9);
                break;
        }
    } else if (Ss > 1.00 && Ss <= 1.25) {
        switch (siteClass) {
            case "A":
                Fa = 0.8;
                break;
            case "B":
                Fa = 1.0;
                break;
            case "C":
                Fa = 1.0;
                break;
            case "D":
                Fa = interpolate(Ss, 1.1, 1.0);
                break;
            case "E":
                Fa = 0.9;
                break;
        }
    } else if (Ss >= 1.25) {
        switch (siteClass) {
            case "A":
                Fa = 0.8;
                break;
            case "B":
                Fa = 1.0;
                break;
            case "C":
                Fa = 1.0;
                break;
            case "D":
                Fa = 1.0;
                break;
            case "E":
                Fa = 0.9;
                break;
        }
    }

    if (SOne <= 0.1) {
        switch (siteClass) {
            case "A":
                Fv = 0.8;
                break;
            case "B":
                Fv = 1.0;
                break;
            case "C":
                Fv = 1.7;
                break;
            case "D":
                Fv = 2.4;
                break;
            case "E":
                Fv = 3.5;
                break;
        }
    } else if (SOne > 0.1 && SOne <= 0.2) {
        switch (siteClass) {
            case "A":
                Fv = 0.8;
                break;
            case "B":
                Fv = 1.0;
                break;
            case "C":
                Fv = interpolateFv(SOne, 1.7, 1.6);
                break;
            case "D":
                Fv = interpolateFv(SOne, 2.4, 2.0);
                break;
            case "E":
                Fv = interpolateFv(SOne, 3.5, 3.2);
                break;
        }
    } else if (SOne > 0.2 && SOne <= 0.3) {
        switch (siteClass) {
            case "A":
                Fv = 0.8;
                break;
            case "B":
                Fv = 1.0;
                break;
            case "C":
                Fv = interpolateFv(SOne, 1.6, 1.5);
                break;
            case "D":
                Fv = interpolateFv(SOne, 2.0, 1.8);
                break;
            case "E":
                Fv = interpolateFv(SOne, 3.2, 2.8);
                break;
        }
    } else if (SOne > 0.3 && SOne <= 0.4) {
        switch (siteClass) {
            case "A":
                Fv = 0.8;
                break;
            case "B":
                Fv = 1.0;
                break;
            case "C":
                Fv = interpolateFv(SOne, 1.5, 1.4);
                break;
            case "D":
                Fv = interpolateFv(SOne, 1.8, 1.6);
                break;
            case "E":
                Fv = interpolateFv(SOne, 2.8, 2.4);
                break;
        }
    } else if (SOne > 0.4 && SOne < 0.5) {
        switch (siteClass) {
            case "A":
                Fv = 0.8;
                break;
            case "B":
                Fv = 1.0;
                break;
            case "C":
                Fv = interpolateFv(SOne, 1.4, 1.3);
                break;
            case "D":
                Fv = interpolateFv(SOne, 1.6, 1.5);
                break;
            case "E":
                Fv = 2.4;
                break;
        }
    } else if (SOne >= 0.5) {
        switch (siteClass) {
            case "A":
                Fv = 0.8;
                break;
            case "B":
                Fv = 1.0;
                break;
            case "C":
                Fv = 1.3;
                break;
            case "D":
                Fv = 1.5;
                break;
            case "E":
                Fv = 2.4;
                break;
        }
    }

    let results = {
        "fa": Fa,
        "fv": Fv
    };

    return results;
}


// function sitecoefficients(soilTypeInput, SsInput, S1Input) {
//     let Ss = SsInput;
//     let SOne = S1Input;
//     let siteClass = '';

//     switch (soilTypeInput) {
//         case "s_a":
//             siteClass = "A";
//             break;
//         case "s_b":
//             siteClass = "B";
//             break;
//         case "s_c":
//             siteClass = "C";
//             break;
//         case "s_d":
//             siteClass = "D";
//             break;
//         case "s_e":
//             siteClass = "E";
//             break;
//     }

//     let Fa, Fv;

//     if (Ss <= 0.25) {
//         switch (siteClass) {
//             case "A":
//                 Fa = 0.8;
//                 break;
//             case "B":
//                 Fa = 1.0;
//                 break;
//             case "C":
//                 Fa = 1.2;
//                 break;
//             case "D":
//                 Fa = 1.6;
//                 break;
//             case "E":
//                 Fa = 2.5;
//                 break;
//         }
//     } else if (Ss > 0.25 && Ss <= 0.5) {
//         switch (siteClass) {
//             case "A":
//                 Fa = 0.8;
//                 break;
//             case "B":
//                 Fa = 1.0;
//                 break;
//             case "C":
//                 Fa = 1.2;
//                 break;
//             case "D":
//                 Fa = interpolate(Ss, 1.6, 1.4);
//                 break;
//             case "E":
//                 Fa = interpolate(Ss, 2.5, 1.7);
//                 break;
//         }
//     }

//     // Calculation for Fv (similar logic to Fa)

//     let results = {
//         "fa": Fa,
//         "fv": Fv
//     };

//     return results;
// }

// class NscpCoef {
//     constructor(distance, sourceType, soilType, zone) {

//         this.distance = distance;
//         this.sourceType = sourceType;
//         this.soilType = soilType;
//         this.zone = zone;
//     }

//     na() {
//         let distance = this.distance;
//         let sourceType = this.sourceType;
//         let Na;

//         if (distance <= 2) {
//             Na = nearSource["Na"]["2"][sourceType];
//         } else if (distance > 2 && distance < 5) {
//             let NaInit1 = nearSource["Na"]["2"][sourceType];
//             let NaInit2 = nearSource["Na"]["5"][sourceType];
//             let Y = 3;
//             let X = NaInit1 - NaInit2;
//             let Y1 = distance - 2;
//             let NaInit = interpolate(X, Y, Y1);
//             Na = NaInit1 - NaInit;
//         } else if (distance == 5) {
//             Na = nearSource["Na"]["5"][sourceType];
//         } else if (distance > 5 && distance < 10) {
//             let NaInit1 = nearSource["Na"]["5"][sourceType];
//             let NaInit2 = nearSource["Na"]["10"][sourceType];
//             let Y = 5;
//             let X = NaInit1 - NaInit2;
//             let Y1 = distance - 5;
//             let NaInit = interpolate(X, Y, Y1);
//             Na = NaInit1 - NaInit;
//         } else if (distance >= 10) {
//             Na = nearSource["Na"]["10"][sourceType];
//         }

//         return Na;
//     }

//     nv() {
//         let distance = this.distance;
//         let sourceType = this.sourceType;
//         let Nv;

//         if (distance <= 2) {
//             Nv = nearSource["Nv"]["2"][sourceType];
//         } else if (distance > 2 && distance < 5) {
//             let init1 = nearSource["Nv"]["2"][sourceType];
//             let init2 = nearSource["Nv"]["5"][sourceType];
//             let Y = 3;
//             let X = init1 - init2;
//             let Y1 = distance - 2;
//             let NvInit = interpolate(X, Y, Y1);
//             Nv = init1 - NvInit;
//         } else if (distance == 5) {
//             Nv = nearSource["Nv"]["5"][sourceType];
//         } else if (distance > 5 && distance < 10) {
//             let init1 = nearSource["Nv"]["5"][sourceType];
//             let init2 = nearSource["Nv"]["10"][sourceType];
//             let Y = 5;
//             let X = init1 - init2;
//             let Y1 = distance - 5;
//             let NvInit = interpolate(X, Y, Y1);
//             Nv = init1 - NvInit;
//         } else if (distance == 10) {
//             Nv = nearSource["Nv"]["10"][sourceType];
//         } else if (distance > 10 && distance < 15) {
//             let init1 = nearSource["Nv"]["10"][sourceType];
//             let init2 = nearSource["Nv"]["15"][sourceType];
//             let distDiff = (distance - 10) / 5;
//             let differenceFactorInit = init1 - init2;
//             let differenceFactor = differenceFactorInit === 1 ? 1 : differenceFactorInit;
//             let a = differenceFactor * distDiff;
//             let b = init1 - a;
//             Nv = b;
//         } else if (distance >= 15) {
//             Nv = nearSource["Nv"]["15"][sourceType];
//         }

//         return Nv;
//     }

//     ca() {
//         let Na = this.na();
//         let soilType = this.soilType;
//         let zone = this.zone;
//         let CaInit = siteCoefficient["Ca"][soilType][zone];

//         function final(value) {
//             if (value === '2') {
//                 return CaInit;
//             } else if (value === '4') {
//                 return CaInit * Na;
//             }
//         }

//         return final(zone);
//     }

//     cv() {
//         let Nv = this.nv();
//         let soilType = this.soilType;
//         let zone = this.zone;
//         let CvInit = siteCoefficient["Cv"][soilType][zone];

//         function final(value) {
//             if (value === '2') {
//                 return CvInit;
//             } else if (value === '4') {
//                 return CvInit * Nv;
//             }
//         }

//         return final(zone);
//     }
// }


// class NscpCoef {
//     constructor(distance, sourceType, soilType, zone) {
//         this.distance = distance;
//         this.sourceType = sourceType;
//         this.soilType = soilType;
//         this.zone = zone;
//     }

//     na() {
//         let distance = this.distance;
//         let sourceType = this.sourceType;

//         if (distance <= 2) {
//             return nearSource["Na"]["2"][sourceType];
//         }
//         // Interpolation logic here
//     }

//     nv() {
//         let distance = this.distance;
//         let sourceType = this.sourceType;

//         if (distance <= 2) {
//             return nearSource["Nv"]["2"][sourceType];
//         }
//         // Interpolation logic here
//     }

//     ca() {
//         let Na = this.na();
//         let CaInit = siteCoefficient["Ca"][this.soilType][this.zone];
//         return this.zone === '2' ? CaInit : CaInit * Na;
//     }

//     cv() {
//         let Nv = this.nv();
//         let CvInit = siteCoefficient["Cv"][this.soilType][this.zone];
//         return this.zone === '2' ? CvInit : CvInit * Nv;
//     }
// }

function responseSpectrumCurve(Ss, S1, Fa, Fv, TL, reduce) {
    let Sms = Fa * Ss;
    let Sm1 = Fv * S1;
    let R = 8;
    let factor = reduce ? (2 / 3) : 1;

    let Sds = factor * Sms;
    let Sd1 = factor * Sm1;
    let To = ((0.20 * Sd1) / Sds);
    let Ts = Sd1 / Sds;

    let xAxisValueCurve = [];
    let yAxisValueCurve = [];
    let scaledCurve = [];

    for (let i = 0; i < 800; i++) {
        let seconds = i / 100;
        let saJsx;

        if (seconds < To) {
            saJsx = Sds * (0.4 + (0.6 * seconds) / To);
        } else if (seconds <= Ts) {
            saJsx = Sds;
        } else if (seconds <= TL) {
            saJsx = Sd1 / seconds;
        } else {
            saJsx = Sd1 * (TL / Math.pow(seconds, 2));
        }

        xAxisValueCurve.push(seconds);
        yAxisValueCurve.push(saJsx);
        scaledCurve.push(saJsx * (1 / R));
    }

    return {
        elastic: {
            x: xAxisValueCurve,
            y: yAxisValueCurve,
            scaled: scaledCurve
        }
    };
}
