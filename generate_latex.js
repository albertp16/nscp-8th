function calculatePeriodNSCP2015(height, materialType) {
    const CONSTANT = 3 / 4;
    if (materialType === "concrete") {
        return 0.0731 * Math.pow(height, CONSTANT);
    } else if (materialType === "steel") {
        return 0.0853 * Math.pow(height, CONSTANT);
    } else {
        return 0.0488 * Math.pow(height, CONSTANT);
    }
}

function calculatePeriodNSCP8TH(height, materialType) {
    let CONSTANTA, CONSTANTB;
    if (materialType === "concrete") {
        CONSTANTA = 0.0466;
        CONSTANTB = 0.9;
    } else if (materialType === "steel") {
        CONSTANTA = 0.0724;
        CONSTANTB = 0.8;
    } else {
        CONSTANTA = 0.0488;
        CONSTANTB = 0.75;
    }
    return CONSTANTA * Math.pow(height, CONSTANTB);
}

function generateSensivity(name, structure_type, fault, soil_type, ss, s1, ss2, ss12) {
    const importance_factor = 1;
    
    //interpolate from the NSCP 2015
    const nscp_init =new NscpCoef(fault, "A", soil_type, '4');
    const na = nscp_init.na();
    const nv = nscp_init.nv();
    const ca = nscp_init.ca();
    const cv = nscp_init.cv();
    // debugger
    let report_title;
    switch (structure_type) {
        case "concrete":
            report_title = "Concrete SMF";
            break;
        case "steel":
            report_title = "Steel SMF";
            break;
        case "concrete_dual":
            report_title = "Concrete Dual SMF";
            break;
        case "brbf":
            report_title = "brbf";
            break;
    }

    let report_title_soil;
    switch (soil_type) {
        case "s_a":
            report_title_soil = " Soil Type A";
            break;
        case "s_b":
            report_title_soil = " Soil Type B";
            break;
        case "s_c":
            report_title_soil = " Soil Type C";
            break;
        case "s_d":
            report_title_soil = " Soil Type D";
            break;
        case "s_e":
            report_title_soil = " Soil Type E";
            break;
    }

    let R1, R2;
    switch (structure_type) {
        case "concrete":
            R1 = 8.5;
            R2 = 8;
            break;
        case "steel":
            R1 = 8;
            R2 = 8;
            break;
        case "concrete_dual":
            R1 = 8.5;
            R2 = 7;
            break;
        case "brbf":
            R1 = 7;
            R2 = 0;
            break;
    }

    const long_period = 8;
    const normalize_weight = 1;

    var fa = sitecoefficients(soil_type, ss, s1).fa;
    var fv = sitecoefficients(soil_type, ss, s1).fv;

    var fa2 = sitecoefficients(soil_type, ss2, ss12).fa;
    var fv2 = sitecoefficients(soil_type, ss2, ss12).fv;
    // debugger
    var height = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150];
    
    var nscp_2015_data = [] //`(${governing_15.toFixed(4)},${i})`;
    var nscp_2024_sam_data = []// `(${governing_8th.toFixed(4)},${i})`;
    var nscp_2024_shade_data = []//`(${governing_8tha.toFixed(4)},${i})`;
    var period_plot_data = []
    for (var i = 0; i <= 15; i += 0.1) {

        period_plot_data.push(i); 

        var base_shear_15 = new BaseShear15(4, nv, ca, cv, importance_factor, R1, i, normalize_weight);
        var base_shear_8th = new BaseShear24(ss, s1, importance_factor, fa, fv, R2, i, long_period);
        var base_shear_8tha = new BaseShear24(ss2, ss12, importance_factor, fa2, fv2, R2, i, long_period);

        var governing_15 = base_shear_15.governingShear();
        var minimum_15 = base_shear_15.minBaseShear();
        var governing_8th = base_shear_8th.governingShear();
        var governing_8tha = base_shear_8tha.governingShear();
        var governing_8th_min = base_shear_8th.minBaseShear();
        var governing_8tha_min = base_shear_8tha.minBaseShear();


        nscp_2015_data.push(governing_15);
        nscp_2024_sam_data.push(governing_8th);
        nscp_2024_shade_data.push(governing_8tha);
    }

    return {
        "period" : period_plot_data,
        "nscp15_min" : minimum_15,
        "nscp15" : nscp_2015_data,
        "sam" : nscp_2024_sam_data,
        "shade" : nscp_2024_shade_data,
        "sam_min" : governing_8th_min,
        "shade_min" : governing_8tha_min
    }
}