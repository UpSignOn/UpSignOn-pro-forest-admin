async function upsignonError() {
  throw new Error("This is currently not allowed by the UpSignOn team.");
}

/** ALL AVAILABLE HOOKS */
// beforeBulkCreate(instances, options);
// beforeBulkDestroy(options);
// beforeBulkUpdate(options);
// beforeCreate(instance, options);
// beforeDestroy(instance, options);
// beforeUpdate(instance, options);
// beforeSave(instance, options);
// beforeUpsert(values, options);

/** TO COPY PASTE */
// model.beforeBulkCreate(upsignonError);
// model.beforeBulkDestroy(upsignonError); OR model.beforeBulkDestroy(()=>{throw new Error("You need to delete the user from the user page");});
// model.beforeBulkUpdate(upsignonError);
// model.beforeCreate(upsignonError);
// model.beforeDestroy(upsignonError);
// model.beforeUpdate(upsignonError);
// model.beforeSave(upsignonError);
// model.beforeUpsert(upsignonError);

module.exports = {
  upsignonError,
};
