package com.wms.wmsbackend.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * Excel导出工具类 - 处理UTF-8编码，防止乱码 Excel Export Utility - Handle UTF-8 encoding to
 * prevent garbled characters
 */
public class ExcelExportUtil {

    /**
     * 导出产品列表到Excel（UTF-8编码） Export product list to Excel with UTF-8 encoding
     *
     * @param headers 表头列表 Column headers
     * @param data 数据列表 Data rows
     * @return 字节数组 Excel file bytes
     * @throws IOException 如果导出失败 If export fails
     */
    public static byte[] exportToExcel(List<String> headers, List<Map<String, Object>> data) throws IOException {
        // 使用XSSF（Excel 2007+）确保UTF-8支持
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Products");

            // 创建表头样式 - 蓝色背景，白色字体，加粗
            CellStyle headerStyle = createHeaderStyle(workbook);

            // 写入表头
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                String headerText = headers.get(i);
                cell.setCellValue(headerText);
                cell.setCellStyle(headerStyle);
                // 自动调整列宽
                sheet.setColumnWidth(i, 20 * 256);
            }

            // 写入数据行
            CellStyle dataStyle = createDataStyle(workbook);
            for (int rowIndex = 0; rowIndex < data.size(); rowIndex++) {
                Row row = sheet.createRow(rowIndex + 1);
                Map<String, Object> rowData = data.get(rowIndex);

                for (int colIndex = 0; colIndex < headers.size(); colIndex++) {
                    Cell cell = row.createCell(colIndex);
                    String columnKey = headers.get(colIndex);
                    Object value = rowData.get(columnKey);

                    if (value != null) {
                        cell.setCellValue(value.toString());
                    } else {
                        cell.setCellValue("");
                    }
                    cell.setCellStyle(dataStyle);
                }
            }

            // 写入字节数组 - 使用UTF-8编码
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * 创建表头样式 Create header cell style
     */
    private static CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        // 设置背景颜色为蓝色
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // 设置字体为白色加粗
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setCharSet(1); // 1 = default charset (support for UTF-8)
        style.setFont(font);

        // 设置居中对齐
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        // 设置边框
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        return style;
    }

    /**
     * 创建数据样式 Create data cell style
     */
    private static CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        // 设置字体 - 支持UTF-8
        Font font = workbook.createFont();
        font.setCharSet(1); // 1 = default charset (support for UTF-8)
        style.setFont(font);

        // 设置对齐方式
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        // 设置边框
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        return style;
    }
}
