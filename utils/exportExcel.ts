import ExcelJS from 'exceljs/dist/exceljs.min.js';

export interface ColumnDef {
  header: string;
  key: string;
  width?: number;
}

export interface SheetOptions {
  name: string;
  columns: ColumnDef[];
  rows: Record<string, any>[];
  isSummary?: boolean;
  autoFilter?: { from: string; to: string };
  mergeColumns?: string[]; // 컬럼 key 목록 (예: ['연도', '소속팀', '사원명'])
  mergeRowRanges?: { rowNumber: number; fromCol: number; toCol: number }[]; // 특정 행 가로 병합
}

/**
 * 기업 보고서 양식의 깔끔한 ExcelJS 워크북 생성
 */
export const createReportWorkbook = (): ExcelJS.Workbook => {
  const wb = new ExcelJS.Workbook();
  wb.creator = '360 Feedback System';
  wb.created = new Date();
  return wb;
};

/**
 * 시트 추가 및 비즈니스 보고서 서식(다크 네이비 헤더, 지브라 패턴, 테두리, 정렬, 자동 줄바꿈, 요약행 하이라이트, 셀 병합, 필터) 적용
 */
export const addReportSheet = (
  workbook: ExcelJS.Workbook,
  options: SheetOptions
): ExcelJS.Worksheet => {
  const { name, columns, rows, isSummary, autoFilter, mergeColumns } = options;
  const ws = workbook.addWorksheet(name);

  // 컬럼 정의
  ws.columns = columns.map(c => ({
    header: c.header,
    key: c.key,
    width: c.width || 18
  }));

  const headerBgArgb = isSummary ? 'FF0F172A' : 'FF1E293B'; // 다크 슬레이트 / 네이비
  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  // 헤더 행 스타일 설정
  const headerRow = ws.getRow(1);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: headerBgArgb }
    };
    cell.font = {
      name: '맑은 고딕',
      size: 10.5,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    cell.border = borderThin;
  });

  // 데이터 행 추가 및 서식 설정
  rows.forEach((rowData, idx) => {
    const row = ws.addRow(rowData);
    const isGroupSummary = !!rowData._isGroupSummary;
    const isOdd = idx % 2 === 0; // 0-indexed (row 2 in excel = even, odd zebra)
    
    // 그룹별 마지막 요약 행인 경우 하이라이트 배경
    const defaultBgArgb = isGroupSummary 
      ? 'FFEFF6FF' // 부드러운 스카이 블루 틴트
      : isOdd 
        ? 'FFFFFFFF' 
        : 'FFF8FAFC'; // 화이트 / 슬레이트 틴트

    let maxLineCount = 1;

    columns.forEach(col => {
      const cell = row.getCell(col.key);
      const valStr = cell.value !== undefined && cell.value !== null ? String(cell.value) : '';
      
      const lineCount = valStr.split('\n').length;
      if (lineCount > maxLineCount) maxLineCount = lineCount;

      const isLongText = col.header.includes('좋은점') || 
                          col.header.includes('바라는점') || 
                          col.header.includes('내용') || 
                          col.header.includes('인사이트');

      const isRehire = col.header.includes('재협업') || col.header.includes('협업') || col.header.includes('소통');
      const isRateOrCount = col.header.includes('희망률') || col.header.includes('참여 인원') || col.header.includes('피드백 수');

      let cellFont: Partial<ExcelJS.Font> = {
        name: '맑은 고딕',
        size: isGroupSummary ? 10 : 10,
        bold: isGroupSummary,
        color: { argb: isGroupSummary ? 'FF0F172A' : 'FF1E293B' }
      };
      let cellBg = defaultBgArgb;

      if (isGroupSummary) {
        if (col.key === '피드백 번호') {
          cellFont = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF2563EB' } };
        } else if (isRehire) {
          cellFont = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF0F172A' } };
          cellBg = 'FFDBEAFE'; // 강조된 블루 배경
        }
      } else if (isRehire) {
        if (valStr.includes('좋아요') && !valStr.includes('싫어요')) {
          cellFont = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF15803D' } };
          cellBg = 'FFECFDF5'; // 소프트 에메랄드
        } else if (valStr.includes('싫어요') && !valStr.includes('좋아요')) {
          cellFont = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
          cellBg = 'FFFEF2F2'; // 소프트 로즈
        } else if (valStr.includes('그저그래요')) {
          cellFont = { name: '맑은 고딕', size: 10, color: { argb: 'FF475569' } };
          cellBg = 'FFF1F5F9';
        }
      } else if (isRateOrCount) {
        cellFont = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: cellBg }
      };
      cell.font = cellFont;
      cell.alignment = {
        horizontal: isLongText ? (isGroupSummary ? 'center' : 'left') : 'center',
        vertical: 'middle',
        wrapText: isLongText
      };
      
      // 요약 행 테두리: 하단 구분을 위해 진한 테두리
      cell.border = isGroupSummary ? {
        top: { style: 'thin', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'medium', color: { argb: 'FF64748B' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      } : borderThin;
    });

    const calculatedHeight = isGroupSummary 
      ? Math.max(36, maxLineCount * 20 + 8) 
      : Math.max(26, Math.min(180, maxLineCount * 18 + 10));
    row.height = calculatedHeight;
  });

  // 셀 병합 처리 (개인 공유하기 등에서 중복 항목 묶음)
  if (mergeColumns && mergeColumns.length > 0 && rows.length > 1) {
    const startRow = 2;
    const endRow = 1 + rows.length;

    mergeColumns.forEach(key => {
      const colIdx = columns.findIndex(c => c.key === key);
      if (colIdx !== -1) {
        const colNum = colIdx + 1;
        ws.mergeCells(startRow, colNum, endRow, colNum);

        const mergedCell = ws.getCell(startRow, colNum);
        mergedCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        };
        mergedCell.font = {
          name: '맑은 고딕',
          size: 10.5,
          bold: true,
          color: { argb: 'FF0F172A' }
        };
        mergedCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      }
    });
  }

  // 특정 행 가로 병합 (요약 행에서 컬럼 가로 병합)
  if (options.mergeRowRanges && options.mergeRowRanges.length > 0) {
    options.mergeRowRanges.forEach(({ rowNumber, fromCol, toCol }) => {
      ws.mergeCells(rowNumber, fromCol, rowNumber, toCol);
      const mergedCell = ws.getCell(rowNumber, fromCol);
      mergedCell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
        indent: 1
      };
      mergedCell.font = {
        name: '맑은 고딕',
        size: 9.5,
        bold: true,
        color: { argb: 'FF1E3A8A' }
      };
      mergedCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDBEAFE' }
      };
    });
  }

  // 필터 기능 적용 (요청된 범위)
  if (autoFilter) {
    ws.autoFilter = autoFilter;
  }

  return ws;
};

/**
 * 모든 브라우저 및 모바일에서 안전하게 엑셀(.xlsx) 파일을 다운로드
 */
export const downloadWorkbook = async (
  workbook: ExcelJS.Workbook,
  fileName: string
): Promise<void> => {
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    if (typeof window !== 'undefined' && (window.navigator as any)?.msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
      return;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 2000);
  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    alert('파일 다운로드 중 오류가 발생했습니다.');
  }
};
