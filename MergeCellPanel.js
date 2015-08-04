
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


