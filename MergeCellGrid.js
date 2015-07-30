
Ext.define('Ext.ux.view.MergeCellTable', {
    extend: 'Ext.view.Table',
    
    alias: ['widget.mergecelltableview'],
    type: 'mergecelltableview',
    baseCls: Ext.baseCSSPrefix + 'mergegrid-view',
    
    stripeRows: false,
    
    separator: '>', // 不同级别分割符
    sameLevelSeparator: '|', // 同级别分割符
    __rowspans: null, // 缓存要合并的列中每个单元格的rowspan, refresh时会删除重新计算
    __merge_columns: null, // 缓存要合并的列, refresh时会删除重新获取
    cellTpl: [ // 增加了rowspan属性
        '<td role="gridcell" class="{tdCls}" {tdAttr} id="{[Ext.id()]}" rowspan="{rowspan}" <tpl if="hidden">style="display:none"</tpl>>',
            '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner {innerCls}"',
                'style="text-align:{align};<tpl if="style">{style}</tpl>">{value}</div>',
        '</td>', {
            priority: 0
        }
    ],
    renderCell: function(column, record, recordIndex, columnIndex, out) { // 添加rowspan与隐藏td
        var me = this,
            rowspans = me.getRowspans();
        
        var rowspan = (rowspans[recordIndex] || {})[column.dataIndex];
        
        cellValues = me.cellValues,
        cellValues.rowspan = rowspan;
        // cellTpl采用了display:none而不是不生成td, 因为若不生成td在使用rowediting时会出错
        cellValues.hidden = rowspan === 0;
        
        me.callParent(arguments);
    },
    onAdd: function(store, records, index, cfg) {
        this.refresh();
    },
    onRemove: function() {
        this.refresh();
    },
    onUpdate: function() {
        this.refresh();
    },
    refresh: function() {
        var me = this;
        
        // 刷新时要重新计算rowspan
        delete me.__rowspans;
        delete me.__merge_columns;
        
        me.callParent(arguments);
    },
    getRowspans: function() {
        var me = this;
        
        // 已经计算过直接返回
        var rowspans = me.__rowspans;
        if (rowspans != null) {
            return rowspans;
        }
        
        // 计算rowspan
        rowspans = [];
        var store = me.dataSource,
            mergeColumns = me.getMergeColumns();
        var setSameLevelRowspan = function(rowspans, rowIndex, columns, rowspan) {// 设置同级其他列的rowspan
            var i, temp, len = columns.length;
            for (i = 1; i < len; i++) {
                temp = columns[i];
                rowspans[rowIndex][temp] = rowspan;
            }
        };
        var calculateRowspans = function(rowspans, mergeColumns, currentColumnIndex, store, from, to) {
            if (currentColumnIndex >= mergeColumns.length) {
                return;
            }
            
            var columns = mergeColumns[currentColumnIndex],
                i, current, prev, mergeStart = 0;
            var column = columns[0];
            
            try {
                for (i = from; i < to + 1; i++) {
                    current = store.getAt(i).get(column);
                    if (current !== prev) {
                        rowspans[i] = rowspans[i] || {};
                        rowspans[i][column] = 1;
                        setSameLevelRowspan(rowspans, i, columns, 1);
                        
                        // 递归获取子列
                        if (prev != null) {
                            calculateRowspans(rowspans, mergeColumns, currentColumnIndex + 1, store, mergeStart, i - 1);
                        }
                        
                        prev = current;
                        mergeStart = i;
                    } else {
                        rowspans[mergeStart][column]++;
                        setSameLevelRowspan(rowspans, mergeStart, columns, rowspans[mergeStart][column]);
                        
                        rowspans[i] = rowspans[i] || {};
                        rowspans[i][column] = 0;
                        setSameLevelRowspan(rowspans, i, columns, 0);
                    }
                }
                if (i > mergeStart) {
                    calculateRowspans(rowspans, mergeColumns, currentColumnIndex + 1, store, mergeStart, i - 1);
                }
            } catch(e) {
                if (console) {
                    console.error(e);
                }
            }
        };
        calculateRowspans(rowspans, mergeColumns, 0, store, 0, store.data.length - 1);
        
        // 缓存
        me.__rowspans = rowspans;
        
        return rowspans;
    },
    getMergeColumns: function() {
        var me = this;
        var columns = me.__merge_columns;
        if (columns != null) {
            return columns;
        }
        
        // 未配置时直接返回
        var mergeColumns = me.mergeColumns;
        if (Ext.isEmpty(mergeColumns)) {
            return [];
        }
        
        // 转换合并规则
        var separator = me.separator,
            sameLevelSeparator = me.sameLevelSeparator;
        columns = mergeColumns.split(separator);
        var i, len = columns.length;
        for (i = 0; i < len; i++) {
            columns[i] = columns[i].split(sameLevelSeparator);
        }
        
        // 缓存
        me.__merge_columns = columns;
        
        return columns;
    }
});

Ext.define('Ext.ux.grid.MergeCellPanel', {
    extend: 'Ext.grid.Panel',
    
    alias: ['widget.mergecellgrid'],
    viewType: 'mergecelltableview',
    
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
            selType: 'cellmodel', // 按单元格选择
            sortableColumns: false, // 禁止排序
            columnLines: true, // 显示网格线
            rowLines: true, // 显示网格线
            trackMouseOver: false // 禁止跟踪鼠标变色
        });
        
        me.callParent();
    }
});


