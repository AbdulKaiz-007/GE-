import pandas as pd
import io

# 1. Prepare the raw data based on your uploaded files
data = {
    'ID': [12496, 24107, 14177, 24381, 25597, 13507, 27974, 19364, 22155],
    'Marital Status': ['Married', 'Married', 'Married', 'Single', 'Single', 'Married', 'Single', 'Married', 'Married'],
    'Gender': ['Female', 'Male', 'Male', 'Male', 'Male', 'Female', 'Male', 'Male', 'Male'],
    'Income': [40000, 30000, 80000, 70000, 30000, 10000, 160000, 40000, 20000],
    'Children': [1, 3, 5, 0, 0, 2, 2, 1, 2],
    'Education': ['Bachelors', 'Partial College', 'Partial College', 'Bachelors', 'Bachelors', 'Partial College', 'High School', 'Bachelors', 'Partial High School'],
    'Occupation': ['Skilled Manual', 'Clerical', 'Professional', 'Professional', 'Clerical', 'Manual', 'Management', 'Skilled Manual', 'Clerical'],
    'Home Owner': ['Yes', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'Yes'],
    'Cars': [0, 1, 2, 1, 0, 0, 4, 0, 2],
    'Commute Distance': ['0-1 Miles', '0-1 Miles', '2-5 Miles', '5-10 Miles', '0-1 Miles', '1-2 Miles', '0-1 Miles', '0-1 Miles', '0-1 Miles'],
    'Region': ['Europe', 'Europe', 'Europe', 'Pacific', 'Europe', 'Europe', 'Pacific', 'Europe', 'Pacific'],
    'Age': [42, 43, 60, 41, 36, 50, 33, 43, 30],
    'Purchased Bike': ['No', 'No', 'No', 'Yes', 'Yes', 'No', 'Yes', 'Yes', 'No']
}

df = pd.DataFrame(data)

# 2. Create the Excel Writer
file_path = 'Bike_Sales_Dashboard_with_Sparklines.xlsx'
writer = pd.ExcelWriter(file_path, engine='xlsxwriter')
workbook = writer.book

# 3. Define Styles
header_fmt = workbook.add_format({'bold': True, 'bg_color': '#4F81BD', 'font_color': 'white', 'border': 1})
kpi_label_fmt = workbook.add_format({'bold': True, 'font_size': 12, 'font_color': '#595959'})
kpi_val_fmt = workbook.add_format({'bold': True, 'font_size': 18, 'font_color': '#2F5597', 'align': 'center'})
border_fmt = workbook.add_format({'border': 1})

# 4. Create the Dashboard Sheet
dashboard = workbook.add_worksheet('Dashboard')
dashboard.set_column('A:F', 18)
dashboard.hide_gridlines(2)

# Title
dashboard.write('A1', 'BIKE SALES PERFORMANCE DASHBOARD', workbook.add_format({'bold': True, 'font_size': 20}))

# KPI Metrics
dashboard.write('A3', 'Total Customers', kpi_label_fmt)
dashboard.write('A4', len(df), kpi_val_fmt)

dashboard.write('B3', 'Total Buyers', kpi_label_fmt)
dashboard.write('B4', len(df[df['Purchased Bike'] == 'Yes']), kpi_val_fmt)

dashboard.write('C3', 'Avg Income', kpi_label_fmt)
dashboard.write('C4', df['Income'].mean(), workbook.add_format({'num_format': '$#,##0', 'bold': True, 'font_size': 18, 'align': 'center'}))

# 5. Regional Trends Table with Sparklines
dashboard.write('A7', 'REGIONAL SALES TRENDS', header_fmt)
dashboard.write('B7', 'BUYERS', header_fmt)
dashboard.write('C7', 'AVG INCOME', header_fmt)
dashboard.write('D7', 'TREND (PURCHASES)', header_fmt)

regions = df['Region'].unique()
start_row = 7

# Mocking some trend data for sparklines (normally you'd group by month/date)
trend_data = [
    [2, 5, 3, 8, 4, 10, 12], # Europe
    [1, 2, 4, 3, 7, 5, 9]    # Pacific
]

for i, region in enumerate(regions):
    row = start_row + i + 1
    reg_df = df[df['Region'] == region]
    buyers = len(reg_df[reg_df['Purchased Bike'] == 'Yes'])
    avg_inc = reg_df['Income'].mean()
    
    dashboard.write(row, 0, region, border_fmt)
    dashboard.write(row, 1, buyers, border_fmt)
    dashboard.write(row, 2, avg_inc, workbook.add_format({'num_format': '$#,##0', 'border': 1}))
    
    # We write the trend data to a hidden area or different sheet to feed the sparkline
    # For simplicity, we'll write it to column Z and use it for the sparkline
    for col_offset, val in enumerate(trend_data[i]):
        dashboard.write(row, 25 + col_offset, val)
    
    # ADD THE SPARKLINE
    dashboard.add_sparkline(row, 3, {
        'range': f'Z{row+1}:AF{row+1}',
        'type': 'line',
        'style': 18,
        'max': True,
        'min': True,
        'series_color': '#4F81BD'
    })
    # Apply border to sparkline cell
    dashboard.write(row, 3, '', border_fmt)

# 6. Save Data Sheet for Reference
df.to_excel(writer, sheet_name='Raw_Data', index=False)

# Close the workbook
writer.close()

print(f"Successfully created {file_path}")