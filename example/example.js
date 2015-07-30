
Ext.onReady(function() {
    
    Ext.create('Ext.ux.grid.MergeCellPanel', {
        renderTo: Ext.getBody(),
        viewConfig: {
            mergeColumns: 'cat1>cat2|cat2_desc'
        },
        store: Ext.create('Ext.data.JsonStore', {
            proxy: {
                type: 'ajax',
                url: 'data.json',
                reader: {
                    type: 'json'
                }
            },
            fields: ['cat1', 'cat2', 'cat2_desc', 'name'],
            autoLoad: true
        }),
        columns: [
            { text: '分类1', dataIndex: 'cat1' },
            { text: '分类2', dataIndex: 'cat2' },
            { text: '分类2描述', dataIndex: 'cat2_desc', flex: 1 },
            { text: '名称', dataIndex: 'name' },
            { text: 'C1' },
            { text: 'C2' },
            { text: 'C3' },
            { text: 'C4' },
            { text: 'C5' }
        ]
    });
   
});


