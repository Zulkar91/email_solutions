/* Global */

const sectionCalc = 'section#calculator '
let plotData = []

/* Selectors */

const elem_plan = document.querySelector(sectionCalc + 'select[name=plan]')
const elem_accountAmount = document.querySelector(sectionCalc + 'input[name=accounts]')
const elem_monthlyEstimate = document.querySelector(sectionCalc + '.monthly-estimate span:last-child')

/* Function */

const populate = () => {
    elem_plan.innerHTML = arrayToOptions(jinja_plans)
    calcuate()
}

const calcuate = () => {
    const tempPlans = {}
    jinja_plans.map(tempPlan => {
        tempPlans[tempPlan['name']] = tempPlan['price']
    })

    console.log(tempPlans)

    const planName = document.querySelector(sectionCalc + `option[value=${elem_plan.value}]`).innerHTML
    const name = elem_accountAmount.value + 'x ' + planName
    const amount = tempPlans[planName] * elem_accountAmount.value

    plotData = [name, amount]

    tablePopulate()
}

/* Utlities */

const arrayToOptions = (list, lower=true) => {
    let options_html = ''

    list.forEach(element => {
        let slug = element["name"].replace(" ", "-")

        if (lower) {
            slug = slug.toLowerCase()
        }
        
        options_html += `<option value='${slug}'>${element["name"]}</option>`
    });

    return options_html
}

const elem_outputTable = (row, column) => {
    return document.querySelector(sectionCalc + `tr:nth-child(${row}) td:nth-child(${column})`)
}

const tableCreate = (row, column) => {
    let cell_html = ''

    for (let row_iteration = 0; row_iteration < row; row_iteration++) {
        cell_html += '<tr>'

        for (let column_iteration = 0; column_iteration < column; column_iteration++) {
            cell_html += '<td></td>'
        }

        cell_html += '</tr>'
    }

    document.querySelector(sectionCalc + 'table').innerHTML = cell_html
}

const tablePopulate = () => {

    elem_outputTable(1, 1).innerHTML = plotData[0]
    elem_outputTable(1, 2).innerHTML = '₹ ' + plotData[1].toFixed(1)

    const GST = (plotData[1] / 100) * 18
    const total = plotData[1] + GST

    elem_outputTable(2, 1).innerHTML = '18% GST'
    elem_outputTable(2, 2).innerHTML = '₹ ' + GST.toFixed(1)
    elem_outputTable(3, 1).innerHTML = 'Total'
    elem_outputTable(3, 2).innerHTML = '₹ ' + total.toFixed(1)

    elem_monthlyEstimate.innerHTML = '₹ ' + (total/12).toFixed(1)
}


/* Calculate Listeners */

elem_plan.addEventListener('change', calcuate)
elem_accountAmount.addEventListener('input', calcuate)

/* Init */


tableCreate(3, 2)
populate()
