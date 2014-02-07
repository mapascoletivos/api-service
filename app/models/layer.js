
/**
 * Module dependencies
 */

var 
	mongoose = require('mongoose'),
	extend = require('mongoose-schema-extend'),
	Schema = mongoose.Schema
	async = require('async');

/**
 * Layer schema
 */

var LayerSchema = new Schema({
	title: { type: String, required: true },
	description: String,
	creator: {type: Schema.ObjectId, ref: 'User'},
	maps: [{type: Schema.ObjectId, ref: 'Map'}],
	features: [{type: Schema.ObjectId, ref: 'Feature'}],
	contents: [{type: Schema.ObjectId, ref: 'Content'}],
	createdAt: {type: Date, default: Date.now},
	updateAt: {type: Date, default: Date.now},
	tags: [String],
	visibility: { type: String, enum: ['Public', 'Visible', 'Private'], default: 'Private'},
	isDraft: {type: Boolean, default: true},
	type: { type: String, enum: ['FeatureLayer', 'TileLayer'], default: 'FeatureLayer'},
	url: String
});

LayerSchema.pre('remove', function(next) {
	var self = this;

	async.each( self.maps, 
		function(mapId, done){
			mongoose.model('Map').findById(mapId, function(err, map){
				map.removeLayerAndSave(self, done);
			})
		}, next);
});

/**
 * Methods
 */

LayerSchema.methods = {
	removeMapAndSave: function(map, done){
		var self = this;
		
		console.log('removing map:'+ map+' from layer.maps '+self.maps )

		self.maps.pull({ _id: map._id });
		
		self.save(done);
	}
}

/**
 * Statics
 */

LayerSchema.statics = {

	/**
	 * Find layer by id
	 *
	 * @param {ObjectId} id
	 * @param {Function} cb
	 * @api private
	 */

	load: function (id, cb) {
		this.findOne({ _id : id })
			.populate('creator')
			.populate('features')
			.populate('contents')
			.exec(cb)
	},
	
	/**
	 * List layers
	 *
	 * @param {Object} options
	 * @param {Function} cb
	 * @api private
	 */

	list: function (options, cb) {
		var criteria = options.criteria || {}

		this.find(criteria)
			.sort({'createdAt': -1}) // sort by date
			.limit(options.perPage)
			.skip(options.perPage * options.page)
		.exec(cb)
	}	
	
}

mongoose.model('Layer', LayerSchema)